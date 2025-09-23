import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const userId = params.id;
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" }, 
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                username: user.username,
                email: user.email,
                elo: {
                    rapid: user.elo.rapid,
                    blitz: user.elo.blitz,
                    bullet: user.elo.bullet
                },
                stats: {
                    wins: user.stats.wins,
                    losses: user.stats.losses,
                    draws: user.stats.draws
                }
            }
        });
        
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
