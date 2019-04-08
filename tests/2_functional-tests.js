/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var thread = [];


chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('Test POST new thread on board board',  function(done){
             chai.request(server)
        .post('/api/threads/board')
        .send({
           text: 'Functional tests post thread',
           delete_password: 'board'
          })
        .end(function(err, res){
            assert.equal(res.status, 200);
            done();
          });
        });
    });
    
    suite('GET', function() {
      test('Test GET 10 more recent threads on board general',  function(done){
             chai.request(server)
        .get('/api/threads/general')
        .end(function(err, res){
            thread = res.body;
            console.log(res.body[0]);
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isAtMost(res.body.length,10);
            assert.isAtMost(res.body[0].replies.length,3);
            assert.property(res.body[0],'_id','Should have _id');
            assert.property(res.body[0],'text','Should have text');
            assert.property(res.body[0],'replies','Should have replies');
            assert.property(res.body[0],'created_on','Should have created_on');
            assert.property(res.body[0],'bumped_on','Should have bumped_on'); 
            assert.isArray(res.body[0].replies);
            done();
          });  
        });
    });
    
    suite('DELETE', function() {
      test('Test DELETE thread',  function(done){
             chai.request(server)
        .delete('/api/threads/general')
        .send({
               thread_id: thread[0]._id,
               delete_password: 'board' 
             })
        .end(function(err, res){
            //console.log(res.body);
            console.log(res.text);
            assert.equal(res.status, 200);
            assert.equal(res.text,'success'); 
            done();
          });  
        });  
            test('Test DELETE thread incorrect password',  function(done){
             chai.request(server)
        .delete('/api/threads/general')
        .send({
               thread_id: thread[1]._id,
               delete_password: 'wrong'
             })
        .end(function(err, res){
            console.log(res.text);
            assert.equal(res.status, 200);
            assert.equal(res.text,'incorrect password');
            done(); 
          });  
        });      
    });
    
    suite('PUT', function() {
     test('Test PUT report thread',  function(done){
             chai.request(server)
        .put('/api/threads/general')
        .send({
               thread_id: thread[2]._id
             })
        .end(function(err, res){
            console.log(res.text);
            assert.equal(res.status, 200);
            assert.equal(res.text,'success'); 
            done();
          });  
        });  

    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('Test POST new reply to thread on board board',  function(done){
             chai.request(server)
        .post('/api/replies/board')
        .send({
           text: 'Functional tests post reply',
           delete_password: 'board',
           thread_id: thread[2]._id
          })
        .end(function(err, res){
            assert.equal(res.status, 200);
            done();
          });
        });
    });
    
    suite('GET', function() {
      test('Test GET thread with all its replies',  function(done){
             chai.request(server)
        .get('/api/replies/general')
        .query({
               thread_id: thread[2]._id
             }
             )
        .end(function(err, res){
            //console.log(res.body);
            assert.equal(res.status, 200);
            assert.isArray(res.body.replies);
            assert.property(res.body,'_id','Should have _id');
            assert.property(res.body,'text','Should have text');
            assert.property(res.body,'replies','Should have replies');
            done();
          });   
        });
    });
    
    suite('PUT', function() {
        test('Test PUT report reply ',  function(done){
         chai.request(server)
      .put('/api/replies/general')
      .send({
             thread_id: thread[2]._id,
             reply_id: thread[2].replies[0]._id

           })
      .end(function(err, res){
          console.log(res.text);
          assert.equal(res.status, 200);
          assert.equal(res.text,'success');
          done(); 
        });  
      });            
    });
    
    suite('DELETE', function() {
      test('Test DELETE reply incorrect password',  function(done){
             chai.request(server)
        .delete('/api/threads/general')
        .send({
              thread_id: thread[2]._id,
               reply_id: thread[2].replies[0]._id,
               delete_password: 'wrong'
             })
        .end(function(err, res){
            console.log(thread[2]);
            console.log(res.text);
            assert.equal(res.status, 200);
            assert.equal(res.text,'incorrect password');
            done(); 
          });  
        });      
      test('Test DELETE reply',  function(done){
             chai.request(server)
        .delete('/api/replies/general')
        .send({
               thread_id: thread[2]._id,
               reply_id: thread[2].replies[0]._id,
               delete_password: 'board' 
             })
        .end(function(err, res){
            //console.log(res.body);
            console.log(res.text);
            assert.equal(res.status, 200);
            assert.equal(res.text,'success'); 
            done();
          });  
        });  

    });
    

  });

});
