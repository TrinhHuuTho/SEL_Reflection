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

exports.sendWelcomeEmail = async (req, res) => {
  try {
    const { to, name } = req.body;

    if (!to || !name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email và tên người dùng'
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'Chào mừng bạn đến với hệ thống!',
      html: `
        <h1>Xin chào ${name}!</h1>
        <p>Chào mừng bạn đến với hệ thống của chúng tôi.</p>
        <p>Cảm ơn bạn đã đăng ký!</p>
        <br>
        <p>Trân trọng,</p>
        <p><strong>Đội ngũ phát triển</strong></p>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Email chào mừng đã được gửi',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Send welcome email error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi email chào mừng',
      error: error.message
    });
  }
};
