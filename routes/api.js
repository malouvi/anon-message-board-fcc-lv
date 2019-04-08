/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectId;

module.exports = function (app) {
  mongoose.connect(process.env.DB,{useNewUrlParser: true })
  //to stop DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead. warning
  mongoose.set('useCreateIndex', true);
  //Create a Schema and a Model
  const replySchema = new mongoose.Schema({
    text:{
      type:String,
      required: true
    },
    created_on:{
      type: Date,
      default: Date.now
    },
    reported:{type: Boolean,
              default: false},
    delete_password:{
      type: String,
      required: true,
      default: false
    }
  });
  const threadSchema = new mongoose.Schema({
    board:{
      type:String,
      required: true    
    },
    text:{
      type:String,
      required: true
    },
    created_on:{
      type: Date,
      default: Date.now
    },
    bumped_on:{
      type: Date,
      default: Date.now
    },
    reported:{
      type: Boolean,
      default: false
    },
    delete_password:{
      type: String,
      required: true
    },
    replies:[replySchema]
  });

  //Model
  const Reply=mongoose.model('Reply',replySchema);
  const Thread=mongoose.model('Thread',threadSchema);

  app.route('/api/threads/:board')

  .get(function (req, res){
  /*  I can GET an array of the most recent 10 bumped 
  * threads on the board with only the most recent 3 replies from /api/threads/{board}.
  * The reported and delete_passwords fields will not be sent.
  */

      Thread.find({board: req.params.board},{replies: {$slice: -3}, "replies.reported": 0,"replies.delete_password": 0, reported: 0, delete_password: 0})
        .sort({created_on: -1})
        .limit(10).exec((err, data) => {
        if(err) {
          return console.log(err+' Error occurred while get find');
        }        
       return res.json(data);     
      });  
  })
  .post(function (req, res){

    const newThread = new Thread({text: req.body.text,delete_password: req.body.delete_password, board: req.params.board});
    newThread.save((err,data) => {
      if(err) {
        return console.log(err+' Error occurred while save ');
      }  
      const redirAddress = '/b/'+req.params.board+'/';
      res.redirect(redirAddress);
    });
  })
  .put(function (req, res){
    /* I can report a thread and change it's reported value to true by sending a PUT request to /api/threads/{board} 
    * and pass along the thread_id. (Text response will be 'success')
    */

    Thread.findOneAndUpdate({_id: ObjectId(req.body.thread_id)},{$set:{reported:true}},(err,data) => {
      if(err) {
        return console.log(err+' Error occurred while delete');  
      }
      res.send('success');
    });
  })
  .delete(function (req, res){
    /* I can delete a thread completely if I send a DELETE request to /api/threads/{board}
    * and pass along the thread_id & delete_password. (Text response will be 'incorrect password' or 'success')
    */
    Thread.findOneAndDelete({_id: ObjectId(req.body.thread_id), delete_password: req.body.delete_password}, (err, data) => {
      if(err) {
        return console.log(err+' Error occurred while delete');  
      }
 
     if (!data)
       return res.send('incorrect password');  
      return res.send('success');
    });
  });
    
  app.route('/api/replies/:board')
  .get(function (req, res){
  /* I can GET an entire thread with all it's replies from /api/replies/{board}?thread_id={thread_id}.
  Also hiding the same fields.
   */
    Thread.findById(req.query.thread_id, {"replies.reported": 0,"replies.delete_password": 0, reported: 0, delete_password: 0},
      (err,data) => {
          if(err) {
            return console.log(err+' Error occurred while get findById');
          } 
      return res.json(data);
      });    
  })
  .post(function (req, res){
/*I can POST a reply to a thead on a specific board by passing form data text, delete_password, & thread_id to /api/replies/{board}
* and it will also update the bumped_on date to the comments date.(Recomend res.redirect to thread page /b/{board}/{thread_id}) 
* In the thread's 'replies' array will be saved _id, text, created_on, delete_password, & reported.
*/

    const newReply = new Thread({text: req.body.text,delete_password: req.body.delete_password});
    Thread.findOneAndUpdate({_id: ObjectId(req.body.thread_id)}, {$set: {bumped_on: Date.now()},$push: {replies: newReply}},
                                                      {returnOriginal: false},(err,data) => {
      if(err){
        console.log("error find Thread"+err);
        return console.log(err);         
      }  

      const redirAddress = '/b/'+req.params.board+'/'+req.body.thread_id;
      res.redirect(redirAddress); 
    });
  })
  .put(function (req, res){
    /* I can report a reply and change it's reported value to true by sending a PUT request to /api/replies/{board} and pass along the 
    * thread_id & reply_id. (Text response will be 'success')
    */
 
     Thread.findOneAndUpdate({_id: ObjectId(req.body.thread_id),"replies._id": ObjectId(req.body.thread_id)},{$set:{"replies.$.reported":true}},(err,data) => {
       if(err) {
        return console.log(err+' Error occurred while put');  
      }
      res.send('success');
    });   
  })

  .delete(function (req, res){
  /*I can delete a post(just changing the text to '[deleted]') if I send a DELETE request to /api/replies/{board} 
  * and pass along the thread_id, reply_id, & delete_password. (Text response will be 'incorrect password' or 'success') 
  */
 
    Thread.findOneAndUpdate({_id: ObjectId(req.body.thread_id), "replies._id": ObjectId(req.body.reply_id), "replies.delete_password": req.body.delete_password},
                         //   {$pull: {replies: {"_id": ObjectId(req.body.reply_id), "delete_password": req.body.delete_password}}},(err,data) => {
        {$set: {"replies.$.text": '[deleted]'}},(err,data) => {
      if(err){
        console.log("error findOneAndUpdate replies delete"+err);
        return console.log(err);         
      } 

      if (!data)
        return res.send('incorrect password');
      return res.send('success');
      
    });
  });

};
