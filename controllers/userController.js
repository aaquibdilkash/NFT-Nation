import User from "../models/user";
import Pin from "../models/pin";
import catchAsyncErrors from "../middleware/catchAsyncErrors";

const allUsers = catchAsyncErrors(async (req, res) => {
    const users = await User.find();
  
      res.status(200).json({
        success: true,
        users,
      });
    
  });

const getUser = catchAsyncErrors(async (req, res) => {

    const user = await User.findById(req.query.id);
  
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found with this ID",
        });
      }
      res.status(200).json({
        success: true,
        user,
      });
    
  });

const createUser = catchAsyncErrors(async (req, res) => {
    let user = await User.findOne({address: req.body.address})

    if (!user) {
        user = await User.create(req.body);
    }
  
    res.status(200).json({
        success: true,
        user,
      });
    
  });

const updateUser = catchAsyncErrors(async (req, res) => {

    let user = await User.findById(req.query.id);
  
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found with this ID",
        });
      }

      user = await User.findByIdAndUpdate(req.query.id, req.body, {
          new: true,
          runValidators: true,
          useFindAndModify: false
      })

      res.status(200).json({
        success: true,
        user,
      });
    
  });

  const deleteUser = catchAsyncErrors(async (req, res) => {

    let user = await User.findById(req.query.id);
  
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found with this ID",
        });
      }

      await user.remove()

      res.status(200).json({
        success: true,
      });
    
  });

export { allUsers, getUser, createUser, updateUser, deleteUser };
