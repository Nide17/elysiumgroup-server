const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const sendEmail = async (email, subject, payload, template) => {
  try {

    // create reusable transporter object using the default SMTP transport with google app passwords
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      service: 'gmail',
      auth: {
        user: 'nidedrogba@gmail.com',
        pass: 'inspjuvfttvcbgtp'
      },
    });

    const source = fs.readFileSync(path.join(__dirname, template), "utf8");
    const compiledTemplate = handlebars.compile(source);

    // Mail options
    const options = () => {
      return {
        from: '"Parmenide" <nidedrogba@gmail.com>',
        to: email,
        subject: subject,
        html: compiledTemplate(payload),
        // attachments: [
        //   {
        //     filename: 'quizLogo.jpg',
        //     path: __dirname + '/template/quizLogo.jpg'
        //   }
        // ]
      };
    };

    // Send email
    transporter.sendMail(options(), (err, info) => {

      if (err) {
        console.log(err);
        return err;

      } else {
        console.log('Email sent to ' + info.envelope.to[0])
        return info;
      }
    });

  } catch (err) {
    return console.log({ msg: err.message });
  }
};

module.exports = sendEmail;