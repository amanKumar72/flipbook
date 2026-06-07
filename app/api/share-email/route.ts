import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify User Session
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, bookId, coupleNames, albumTitle } = await req.json();

    if (!email || !bookId || !coupleNames || !albumTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Configure Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVICE || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: parseInt(process.env.EMAIL_PORT || "587") === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // 3. Construct Album Viewer link
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const viewerLink = `${origin}/viewer/${bookId}`;

    // 4. Premium HTML Invitation Template (Gold and Charcoal)
    const mailOptions = {
      from: `"${coupleNames} via Flippy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `You're Invited: View the Wedding Album of ${coupleNames}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Georgia', serif; background-color: #0c0908; color: #eae4d2; margin: 0; padding: 40px 20px; }
            .card { max-width: 550px; margin: 0 auto; background-color: #16100d; border: 1px solid #daaf37; padding: 40px 30px; text-align: center; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
            .emblem { font-size: 48px; color: #daaf37; line-height: 1; margin-bottom: 20px; }
            h1 { font-size: 24px; letter-spacing: 0.1em; color: #f5f5f4; margin: 0 0 10px 0; text-transform: uppercase; }
            h2 { font-size: 18px; font-weight: normal; font-style: italic; color: #daaf37; margin: 0 0 30px 0; }
            .divider { height: 1px; width: 100px; background-color: rgba(218, 175, 55, 0.4); margin: 0 auto 30px auto; }
            p { font-size: 14px; line-height: 1.8; color: #a8a29e; margin: 0 0 35px 0; }
            .button { display: inline-block; padding: 14px 28px; background-color: #daaf37; color: #0c0908 !important; text-decoration: none; font-weight: bold; border-radius: 4px; letter-spacing: 0.1em; text-transform: uppercase; font-size: 12px; transition: all 0.3s; box-shadow: 0 4px 10px rgba(218, 175, 55, 0.2); }
            .footer { margin-top: 40px; font-size: 10px; color: #daaf37; font-family: monospace; letter-spacing: 0.2em; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="emblem">❦</div>
            <h1>Our Wedding Album</h1>
            <h2>${coupleNames}</h2>
            <div class="divider"></div>
            <p>
              We are delighted to invite you to look back on the beautiful memories of our wedding day.<br>
              Browse our digital layflat album: <strong>"${albumTitle}"</strong>.
            </p>
            <a href="${viewerLink}" class="button" target="_blank">Open Digital Album</a>
            <div class="footer">✦ Flippy Showcase ✦</div>
          </div>
        </body>
        </html>
      `,
    };

    // 5. Send Email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Invitation sent successfully!" });
  } catch (error: any) {
    console.error("Nodemailer send error:", error);
    return NextResponse.json(
      { error: "Failed to send email: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
