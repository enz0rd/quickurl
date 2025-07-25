import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

export async function ResetPasswordEmail(to: string, token: string) {
    if (!to || !token) {
        return { message: "Email or token is missing", status: 400 };
    }

    const reset_link = `${process.env.PUBLIC_APP_URL}/reset-password?token=${token}`;
    const year = new Date().getFullYear();

    const html = `<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Reset Your Password</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet" />
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #151515;
            font-family: 'Poppins', Arial, sans-serif;
        }

        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #242424;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .logo {
            display: flex;
            flex-direction: row;
            gap: 1rem;
            align-items: center;
            justify-content: center;
            text-align: center;
            margin-bottom: 30px;
        }

        .logo img {
            max-height: 50px;
        }

        h1 {
            color: #f7f7f7;
            text-align: center;
            font-weight: 600;
        }

        p {
            color: #adadad;
            font-size: 16px;
            line-height: 1.5;
            font-weight: 400;
            text-align: center;
        }

        .button {
            display: block;
            width: fit-content;
            margin: 30px auto;
            padding: 12px 24px;
            background-color: #007a00;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
        }

        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #999999;
            font-weight: 400;
        }

        span {
            font-size: 18px;
            color: #00b800;
            font-weight: 500;
            margin-left: 10px;
        }

        .logo-text {
            display: flex;
            flex-direction: row;
            align-items: center;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="logo">
            <img src="http://www.quickurl.com.br/assets/logo/png/quickurl_icon_nobg.png" alt="quickurl logo" />
            <div class="logo-text">
                <h1>quickurl</h1>
                <span>beta</span>
            </div>
        </div>

        <h1>Reset Your Password</h1>

        <p>
            You requested a password reset for your account. Click the button below to proceed:
        </p>

        <a class="button" href="${reset_link}">Reset Password</a>

        <p>This link will expire in 15 minutes.</p>

        <p>If you didn’t request this, you can safely ignore this email.</p>

        <div class="footer">
            &copy; ${year} QuickURL. All rights reserved.
        </div>
    </div>
</body>
</html>`

    const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "Password Reset Request - QuickURL",
        html: html
    })

    if (info.accepted.length > 0) {
        return { message: "Email sent successfully", status: 200 };
    }
    return { message: "Email not sent", status: 500 };
}

export async function ChangedEmail(to: string, token: string) {
    if (!to) {
        return { message: "Email is missing", status: 400 };
    }

    const year = new Date().getFullYear();
    const change_link = `${process.env.PUBLIC_APP_URL}/confirm-new-email?token=${token}`;

    const html = `<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Email changed successfully</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet" />
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #151515;
            font-family: 'Poppins', Arial, sans-serif;
        }

        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #242424;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .logo {
            display: flex;
            flex-direction: row;
            gap: 1rem;
            align-items: center;
            justify-content: center;
            text-align: center;
            margin-bottom: 30px;
        }

        .logo img {
            max-height: 50px;
        }

        h1 {
            color: #f7f7f7;
            text-align: center;
            font-weight: 600;
        }

        p {
            color: #adadad;
            font-size: 16px;
            line-height: 1.5;
            font-weight: 400;
            text-align: center;
        }

        .button {
            display: block;
            width: fit-content;
            margin: 30px auto;
            padding: 12px 24px;
            background-color: #007a00;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
        }

        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #999999;
            font-weight: 400;
        }

        span {
            font-size: 18px;
            color: #00b800;
            font-weight: 500;
            margin-left: 10px;
        }

        .logo-text {
            display: flex;
            flex-direction: row;
            align-items: center;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="logo">
            <img src="http://www.quickurl.com.br/assets/logo/png/quickurl_icon_nobg.png" alt="quickurl logo" />
            <div class="logo-text">
                <h1>quickurl</h1>
                <span>beta</span>
            </div>
        </div>

        <h1>Your email has been changed</h1>

        <p>
            You changed your email for your account. Click the button below to confirm it:
        </p>

        <a class="button" href="${change_link}">Confirm email</a>

        <p>This link will expire in a day.</p>

        <p>If you didn’t request this, you can safely ignore this email.</p>

        <div class="footer">
            &copy; ${year} QuickURL. All rights reserved.
        </div>
    </div>
</body>
</html>`

    const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "Email Changed - QuickURL",
        html: html
    })

    if (info.accepted.length > 0) {
        return { message: "Email sent successfully", status: 200 };
    }
    return { message: "Email not sent", status: 500 };
}

export async function Reset2FA(to: string, token: string) {
    if (!to) {
        return { message: "Email is missing", status: 400 };
    }

    const year = new Date().getFullYear();
    const reset_link = `${process.env.PUBLIC_APP_URL}/reset-two-factor?token=${token}`;

    const html = `<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Reset 2FA Request</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet" />
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #151515;
            font-family: 'Poppins', Arial, sans-serif;
        }

        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #242424;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .logo {
            display: flex;
            flex-direction: row;
            gap: 1rem;
            align-items: center;
            justify-content: center;
            text-align: center;
            margin-bottom: 30px;
        }

        .logo img {
            max-height: 50px;
        }

        h1 {
            color: #f7f7f7;
            text-align: center;
            font-weight: 600;
        }

        p {
            color: #adadad;
            font-size: 16px;
            line-height: 1.5;
            font-weight: 400;
            text-align: center;
        }

        .button {
            display: block;
            width: fit-content;
            margin: 30px auto;
            padding: 12px 24px;
            background-color: #007a00;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
        }

        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #999999;
            font-weight: 400;
        }

        span {
            font-size: 18px;
            color: #00b800;
            font-weight: 500;
            margin-left: 10px;
        }

        .logo-text {
            display: flex;
            flex-direction: row;
            align-items: center;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="logo">
            <img src="http://www.quickurl.com.br/assets/logo/png/quickurl_icon_nobg.png" alt="quickurl logo" />
            <div class="logo-text">
                <h1>quickurl</h1>
                <span>beta</span>
            </div>
        </div>

        <h1>You requested to reset 2FA</h1>

        <p>
            You requested to reset 2FA for your account. Click the button below to confirm it:
        </p>

        <a class="button" href="${reset_link}">Reset 2FA</a>

        <p>This link will expire in 15 minutes.</p>

        <p>If you didn’t request this, you can safely ignore this email.</p>

        <div class="footer">
            &copy; ${year} QuickURL. All rights reserved.
        </div>
    </div>
</body>
</html>`

    const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "2FA Reset Request - QuickURL",
        html: html
    })

    if (info.accepted.length > 0) {
        return { message: "Email sent successfully", status: 200 };
    }
    return { message: "Email not sent", status: 500 };
}