const mongoose = require('mongoose');
const {User} = require('../model/user.model');
const {Subscription} = require('../model/subscription.model')
var bcrypt = require('bcryptjs');
const saltRounds = 10;

const { successResponse, errorResponse } = require('../helpers/response');
const { generateWebToken, } = require('../helpers/jwt');
const { nanoid } = require('nanoid');


exports.userRegister = async (req, res) => {
  try {
    const { email, password, user_name } = req.body;
    if (!email || !password || !user_name) {
      return errorResponse(400, "Email, username, and password are required.", res);
    }
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const userID = `usr${nanoid()}`;

    const newUser = new User({
      email,
      user_name,
      password: hashedPassword,
      userId: userID,
    });
    const savedUser = await newUser.save();
    successResponse(201, "User has been added successfully.", savedUser, res);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];
      return errorResponse(400, `Duplicate value: ${field} '${value}' already exists.`, res);
    }
    errorResponse(500, err.message, res);
  }
}

exports.userLogin = async (req, res) => {
  try {
      let { email, user_name, password } = req.body;
      await User.findOne({ $or: [{ email: email }, { user_name: user_name }] }).then((docs) => {
          if (!docs) {
              errorResponse(422, "Account does not exists.", res);
          } else {
            console.log("docs", docs);
              {
                  if (bcrypt.compareSync(password, docs["_doc"].password) === true) {
                      docs['_doc'].auth_token = `Bearer ${generateWebToken(docs._id)}`
                      successResponse(200, "Login successfully.", docs, res);
                  } else {
                      errorResponse(422, "Password does not matched.", res)
                  }
              }
          }
      }).catch((err) => {
          console.log('error---->', err);
      })
  }
  catch (err) {
    errorResponse(500, err.message, res);
  }
}

// exports.getAllUsers = async (req, res) => {
//   try {
//     let filter = {}
//     await User.find(filter).sort({ _id: -1 })
//       .select("-password -created_at -updated_at -__v")
//       .then(docs => { successResponse(200, "Users retrieved successfully.", docs, res) })
//       .catch(err => { console.log('err', err) });
//   } catch (error) {
//     console.log('error--->', error);
//   }
// }

exports.getUserById = async (req, res) => {
  try {
    let docId = req.params.id;
    await User.findOne({ _id: docId }).select("-password").then(docs => {
      successResponse(200, "User retrieved successfully.", docs, res)
    }).catch(err => {     
      errorResponse(500, err.message, res);
    });
  } catch (error) {
    errorResponse(500, err.message, res);
  }
}

exports.updateUser = async (req, res) => {
  try {
    const user = req.userData;
    const { email, user_name, password } = req.body;
    const updatedData = {};

    if (email) {
      const existingEmailUser = await User.findOne({ email }).select("_id");
      if (existingEmailUser && existingEmailUser._id.toString() !== user._id.toString()) {
        return errorResponse(422, "Email is already associated with an account.", res);
      }
      updatedData.email = email;
    }
    if (user_name) {
      const existingUserNameUser = await User.findOne({ user_name }).select("_id");
      if (existingUserNameUser && existingUserNameUser._id.toString() !== user._id.toString()) {
        return errorResponse(422, "User Name is already associated with an account.", res);
      }
      updatedData.user_name = user_name;
    }

    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      updatedData.password = hashedPassword;
    }

    await User.findOneAndUpdate({ _id: req.userData._id }, { $set: updatedData }).then(async (docs) => {
        successResponse(200, "User has been updated successfully.", updatedData, res);
    }).catch(async (err) => {
      errorResponse(500, err.message, res);
    })
  }
  catch (err) {
    errorResponse(500, err.message, res);
  }
}

exports.removeUser = async (req, res) =>{
 try{
  let userId =new mongoose.Types.ObjectId(req.userData._id);
    await User.deleteOne({_id: userId}).then((docs)=>{
       successResponse(200, "Users account has been removed successfully", {}, res)
    }).catch((err)=>{
      errorResponse(422, err.message, res);
    })
 }catch(err){
  errorResponse(500, err.message, res);
 }
}

exports.createSubscriptionByWebhook = async (req, res) => {
  try {
    let {user_name, serviceName, serviceLink, monthlyFee, startDate } = req.body;
    const user = await User.findOne({ user_name: user_name });
    if (!user) {
      return errorResponse(404, "User not found.", res);
    }
      const userId =new mongoose.Types.ObjectId(user._id);
      let object = {
        serviceName: serviceName,
        serviceLink: serviceLink,
        monthlyFee:`${monthlyFee}`,
        startDate:startDate,
        userId:userId
      }
        const serviceID = `srv${nanoid()}`; 
        object['serviceID'] = serviceID;
        await new Subscription(object).save().then(async (docs) => {
          successResponse(201, "Subscription has been added successfully.", docs, res);
        }).catch(err => {
          errorResponse(422, err.message, res)
        })
  } catch (err) {
    errorResponse(422, err.message, res)
  }
}

exports.createSubscription = async (req, res) => {
  try {
    let {serviceName, serviceLink, monthlyFee, startDate } = req.body;
      const userId =new mongoose.Types.ObjectId(req.userData._id);
      let object = {
        serviceName: serviceName,
        serviceLink: serviceLink,
        monthlyFee:`${monthlyFee}`,
        startDate:startDate,
        userId:userId
      }
        const serviceID = `srv${nanoid()}`; 
        object['serviceID'] = serviceID;
        await new Subscription(object).save().then(async (docs) => {
          successResponse(201, "Subscription has been added successfully.", docs, res);
        }).catch(err => {
          errorResponse(422, err.message, res)
        })
  } catch (err) {
    errorResponse(422, err.message, res)
  }
}
exports.getAllSubscriptions = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userData._id);  
    const subscriptions = await Subscription.find({ userId });
    if (!subscriptions.length) {
      return errorResponse(404, "No subscriptions found.", res);
    }
    successResponse(200, "Subscriptions retrieved successfully.", subscriptions, res);
  } catch (err) {
    errorResponse(500, err.message, res);
  }
};

exports.updateSubscription = async (req,res)=>{
  try{
  const { serviceName, serviceLink, monthlyFee , startDate} = req.body;
  const updatedData = {};
  if (serviceName) updatedData['serviceName'] = serviceName;
  if (serviceLink) updatedData['serviceLink'] = serviceLink;
  if (monthlyFee) updatedData['monthlyFee'] = monthlyFee;
  if (startDate) updatedData['startDate'] = startDate;

  if (Object.keys(updatedData).length === 0) {
    return errorResponse(400, "No valid fields provided for update.", res);
  }
  await Subscription.findOneAndUpdate({ serviceID: req.query.serviceID }, { $set: updatedData }).then(async (docs) => {
      successResponse(200, "Subscription has been updated successfully.", updatedData, res);
  }).catch(async (err) => {
    errorResponse(500, err.message, res);
  })
}
catch (err) {
  errorResponse(500, err.message, res);
}
}

exports.deleteSubscription = async (req,res)=>{
  try{
  await Subscription.deleteOne({ serviceID: req.query.serviceID }).then(async (docs) => {
      successResponse(200, "Subscription has been deleted successfully.", {}, res);
  }).catch(async (err) => {
    errorResponse(500, err.message, res);
  })
}
catch (err) {
  errorResponse(500, err.message, res);
}
}

exports.getSubscriptionbyUserName = async (req,res)=>{
  try {
    const user_name = req.query.user_name;
    const user = await User.findOne({ user_name: user_name });
    console.log("user", user);
    
    if (!user) {
      return errorResponse(404, "User not found.", res);
    }
    const subscriptions = await Subscription
      .find({ userId: user._id })  
      .populate('userId', 'user_name email');

    if (!subscriptions.length) {
      return errorResponse(404, "No subscriptions found.", res);
    }

    successResponse(200, "Subscriptions retrieved successfully.", subscriptions, res);

  } catch (err) {
    console.log("err", err);
    
    errorResponse(500, err.message || "Internal Server Error", res);
  }
}
