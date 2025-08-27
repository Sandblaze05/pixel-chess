import User from "../models/User.js";

export const reportResult = async (req, res) => {
    const { result, mode } = req.body;
    const user = req.user;

    if (!['win', 'loss', 'draw'].includes(result)) return res.status(400).json({ message: "bad result" });

    if (result  === 'win') user.stats.wins += 1;
    else if (result === 'loss') user.stats.losses += 1;
    else if (result === 'draw') user.stats.draws += 1;

    if (mode && user.elo[mode] !== undefined) {
        if (result === 'win') user.elo[mode] += 10;
        if (result === 'loss') user.elo[mode] -= 10;
    }

    await user.save();
    res.json(user);
}