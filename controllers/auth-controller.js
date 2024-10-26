const User = require("../models/User-model")
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRETE
});

const generateUserId = (name, phone) => {
  return (`${name.slice(0, 3)}-${phone.slice(-3)}`).toUpperCase();
}

const signUp = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (user) {
      res.status(400).json({ message: "Email Already Exists Kindly Login ! " })
    } else {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: '/idgenerator/users' },
        async (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Upload to Cloudinary failed', details: err });
          }
          const Id = generateUserId(req.body.name, req.body.phone);
          const newUser = await User.create({ ...req.body, userId: Id, image: result.secure_url, imageId: result.public_id })
          res.status(200).json({ message: "Accout Created Successfully ", token: newUser.generateToken() })
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Intenal Server Error !" })
  }
}


const logIn = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if ((user) && (await user?.validatePassword(req.body.password))) {
      res.status(200).json({ message: "Loged in SuccessFully ", token: user.generateToken() })
    }
    else {
      res.status(400).json({ message: "Invalid Email or Password " })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal Server Error " })
  }

}

const getUserData = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.userData.email })
    res.status(200).json(userData)
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" })
  }
}

module.exports = { logIn, signUp, getUserData }