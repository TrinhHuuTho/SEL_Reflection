const transporter = require('../config/email');

exports.sendEmail = async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin: to, subject, text/html'
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Email đã được gửi thành công',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi email',
      error: error.message
    });
  }
};
