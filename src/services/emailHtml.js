const emailTemplate = (authCode) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    /* General Styles */
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      text-align: center;
    }

    .container {
      max-width: 600px;
      margin: 40px auto;
      padding: 30px;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }

    /* Header */
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #eeeeee;
    }

    .logo {
      max-width: 150px;
      margin-bottom: 10px;
    }

    h1 {
      font-size: 24px;
      color: #333;
      margin: 0;
    }

    /* Email Body */
    .content {
      text-align: center;
      color: #555;
      font-size: 16px;
      line-height: 1.6;
      padding: 20px;
    }

    .verification-box {
      background-color: #007bff;
      color: #ffffff;
      font-size: 18px;
      padding: 12px 24px;
      display: inline-block;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      margin: 20px auto;
    }

    .verification-box:hover {
      background-color: #0056b3;
    }

    /* Footer */
    .footer {
      margin-top: 20px;
      font-size: 14px;
      color: #777;
    }

    /* Responsive Design */
    @media screen and (max-width: 600px) {
      .container {
        width: 90%;
        padding: 20px;
      }

      h1 {
        font-size: 22px;
      }

      .content {
        font-size: 14px;
      }

      .verification-box {
        font-size: 16px;
        padding: 10px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://yourwebsite.com/logo.png" alt="iLearna Logo" class="logo">
      <h1>Welcome to iLearna</h1>
    </div>
    
    <div class="content">
      <p>Thank you for signing up! To complete your registration, please verify your email by clicking the button below:</p>
      
      <a href="https://www.ilearn.com/verifyEmail" class="verification-box">Verify Email</a>
      <div class="otp-container">
        <span class="otp">${authCode}</span>
      </div>
      <p>If you did not create an account, you can safely ignore this email.</p>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} iLearna. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
};

module.exports = emailTemplate;
