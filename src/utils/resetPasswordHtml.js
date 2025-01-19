const resetPsswordTemplate = (authCode) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
      body {
        font-family: 'Arial', sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
        text-align: center;
      }
  
      .container {
        max-width: 600px;
        margin: 50px auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
  
      h2 {
        color: #333;
      }
  
      p {
        color: #555;
        line-height: 1.6;
      }
  
      .otp-container {
        background-color: #eaeaea;
        padding: 20px;
        border-radius: 8px;
        margin-top: 20px;
      }
  
      .otp {
        font-size: 24px;
        color: #333;
        padding: 10px;
        border: 2px solid #ccc;
        border-radius: 4px;
        display: inline-block;
      }
  
      .footer {
        margin-top: 20px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Certify</h2>
      <h2>reset your password</h2> 
      <p>if you ask to reset your password , this is your reset password code please provide it in the link below. </p>
      <p> if you don't  , please ignore</p>
  
      <div class="otp-container">
        <span class="otp">${authCode}</span>
      </div>
  
      <p class="footer"> Do not share it with anyone.</p>
    </div>
  </body>
  </html>
  `;
};

module.exports = resetPsswordTemplate;