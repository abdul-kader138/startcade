export class Helper {
  verification_email_body = (link: string) => {
    return `<h3>Welcome to FX Rumble!</h3>
             <p>Please click the link below to verify your email:</p>
             <a href="${link}" target="_blank">Email Verify</a>
             <p>If you didn't sign up, you can ignore this email.</p>`;
  };
  reset_password_email_body = (link: string) => {
    return `<h3>Welcome to FX Rumble!</h3>
             <p>Please click the link below to reset your password:</p>
             <a href="${link}" target="_blank">Reset Password</a>
             <p>If you don't want to reset password, you can ignore this email.</p>`;
  };
  subscription_email_body = (link: string) => {
    return`
        <p>Thank you for subscribing to FX Rumble Newsletter!</p>
        <p><a href="${link}">Click here to confirm</a></p>
        <p>If you don't want to reset password, you can ignore this email.</p>`;
  };
}
