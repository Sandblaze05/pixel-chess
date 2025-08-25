import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import User from "@/models/User";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await connectDB();

                if (!credentials.email || !credentials.password) {
                    return null;
                }

                const user = await User.findOne({ email: credentials.email });
                if (!user) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    return null;
                }

                return {
                    id: user._id.toString(),
                    username: user.username,
                    email: user.email
                }
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account.provider === "google") {
                const existingUser = await User.findOne({ email: user.email });

                if (existingUser) {
                    existingUser.provider = "google";
                    await existingUser.save();
                    return true;
                } else {
                    const newUser = new User({
                        email: user.email,
                        username: profile.name || user.name,
                        provider: "google"
                    });
                    await newUser.save();
                    return true;
                }
            }

            return true; // allow all other logins
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };