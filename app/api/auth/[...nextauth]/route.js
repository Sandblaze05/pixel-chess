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
                    throw new Error(`NO_USER`);
                }

                if (user.provider && user.provider !== "credentials") {
                    throw new Error(`USE_GOOGLE`);
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error(`INVALID_PASSWORD`);
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
            await connectDB();
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
                await connectDB();
                const dbUser = await User.findOne({ email: user.email });
                token.id = dbUser?._id.toString();
                token.username = dbUser?.username;
                token.email = dbUser?.email;
            }
            return token;
        },


        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.username = token.username;
                session.user.email = token.email;

                const user = await User.findById(token.id).lean(); // fetch player data

                if (user) {
                    session.user.elo = user.elo;
                    session.user.stats = user.stats;
                    session.user.guildId = user.guildId;
                }
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

// session structure
// {
//   "user": {
//     "id": "12345",
//     "username": "tejas",
//     "email": "tejas@example.com",
//     "elo": {
//       "rapid": 1200,
//       "blitz": 1200,
//       "bullet": 1200
//     },
//     "stats": {
//       "wins": 0,
//       "losses": 0,
//       "draws": 0
//     },
//     "guildId": null
//   }
// }
