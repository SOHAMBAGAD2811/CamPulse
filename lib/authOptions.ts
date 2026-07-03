import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseServer } from "@/lib/supabase-server";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "College UID",
      credentials: {
        uid: { label: "UID", type: "text", placeholder: "e.g. 2023CS001" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.uid || !credentials?.password) {
          throw new Error("Missing UID or password");
        }
        
        const uid = credentials.uid.toUpperCase();
        const password = credentials.password;

        // 1. Check Students
        const { data: student } = await supabaseServer
          .from("students")
          .select("uid, name, department_id, password")
          .ilike("uid", uid)
          .single();
          
        if (student && student.password) {
          // Support both bcrypt hashes and legacy plain-text passwords
          const isMatch = student.password.startsWith('$2')
            ? await bcrypt.compare(password, student.password)
            : student.password === password;
          if (isMatch) {
            return { id: student.uid, name: student.name, role: "student", department_id: student.department_id };
          }
        }

        // 2. Check Staff
        const { data: staff } = await supabaseServer
          .from("staff")
          .select("suid, name, department_id, password")
          .ilike("suid", uid)
          .single();
          
        if (staff && staff.password) {
          const isMatch = staff.password.startsWith('$2')
            ? await bcrypt.compare(password, staff.password)
            : staff.password === password;
          if (isMatch) {
            return { id: staff.suid, name: staff.name, role: "staff", department_id: staff.department_id };
          }
        }

        // 3. Check HODs
        const { data: hod } = await supabaseServer
          .from("hods")
          .select("huid, name, department_id, password")
          .ilike("huid", uid)
          .single();
          
        if (hod && hod.password) {
          const isMatch = hod.password.startsWith('$2')
            ? await bcrypt.compare(password, hod.password)
            : hod.password === password;
          if (isMatch) {
            return { id: hod.huid, name: hod.name, role: "hod", department_id: hod.department_id };
          }
        }

        // If nothing matched
        throw new Error("Invalid UID or password");
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // The first time a user logs in, 'user' is populated from the authorize function
      if (user) {
        token.uid = user.id;
        token.role = (user as any).role;
        token.department_id = (user as any).department_id;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose the data securely to the server/client session object
      if (token && session.user) {
        (session.user as any).uid = token.uid;
        (session.user as any).role = token.role;
        (session.user as any).department_id = token.department_id;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  pages: {
    signIn: '/', // Using the existing landing page unified login
  },
  secret: process.env.NEXTAUTH_SECRET,
};
