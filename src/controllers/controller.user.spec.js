import 'babel-polyfill'
import passport         from 'passport'
import mongoose         from 'mongoose'
import User             from '../models/model.user'
import sinon            from 'sinon'
import 'sinon-mongoose'
import chai             from 'chai'
import boom             from 'boom'
import {
    getSingle,    
    getAll,    
    deleteUser,
    updateUser,
    userExists
}                       from './controller.user'


process.env.NODE_ENV    = 'test'
const expect            = chai.expect

describe('[USER_API] User Controller', () => {


    /**
     * ./controller.user getSingle()
     */
    describe('getSingle()', () => {
        let UserStub, next, BoomStub, sandbox

        beforeEach(() => {
            sandbox     = sinon.createSandbox()
            UserStub    = sandbox.stub(User, 'findById')            
            next        = sandbox.spy()
        })
        afterEach(() => {
            sandbox.restore()
        })
       
        it('Should return single user from database', async () => {

            const   req       = { payload: { id: '123456789' } }, 
                    res       = { json: sandbox.spy() },               
                    mockData  = { username: 'username', id: '123456789' }  

            UserStub.callsFake(() => mockData) 

            await getSingle(req, res, next)

            expect(next.notCalled).to.be.true                                   //checks if any error was dispatched
            expect(UserStub.calledOnceWith(req.payload.id)).to.be.true          //User method called once with user id       
            expect(res.json.calledOnceWith({user: {...mockData}})).to.be.true   //function returns user       
        
        })
    
    
        it('Should return error if user not found', async () => {

            const   req   = { payload: { id: '123456789' } }, 
                    res   = {}

            BoomStub    = sandbox.stub(boom, 'notFound')                

            UserStub.callsFake(() => null)

            await getSingle(req, res, next)

            expect(UserStub.calledOnce).to.be.true                              //checks if User method called
            expect(next.calledOnce).to.be.true                                  //Checks if callback function called
            expect(BoomStub.calledOnceWith('User not found')).to.be.true        //checks if callback with error handler with args was called
        
        })            
        it('Should return error if user id is not present', async () => {

            const   req   = {}, 
                    res   = {}

            BoomStub    = sandbox.stub(boom, 'unauthorized')                

            await getSingle(req, res, next)

            expect(UserStub.calledOnce).to.be.false                             //checks if User method called
            expect(next.calledOnce).to.be.true                                  //Checks if callback function called
            expect(
                BoomStub
                    .calledOnceWith('You are not supposed to call this function'))
                    .to.be.true                                                 //checks if callback with error handler with args was called
        
        })
        it('Should return error server throws', async () => {

            const   req   = { payload: { id: '123456789' } },
                    res   = {}

            BoomStub    = sandbox.stub(boom, 'badImplementation')

            UserStub.callsFake(() => {throw new Error()})                       //Throw error after database call

            await getSingle(req, res, next)

            expect(UserStub.calledOnce).to.be.true                              //checks if User method called
            expect(next.calledOnce).to.be.true                                  //Checks if callback function called
            expect(BoomStub.calledOnceWith('Something went wrong')).to.be.true  //checks if callback with error handler with args was called

        }) 
    })
   
    describe('getAll()', () => {
        let next, sandbox
        beforeEach(() => {
            sandbox = sinon.createSandbox()
            next    = sandbox.spy()
        })
        afterEach(() => {
            sandbox.restore()
        })
        it('Should call find method of mongo model', async () => {
            const   req         = {},
                    res         = {},
                    UserStub    = sandbox.stub(User, 'find')

            await getAll(req, res, next)

            expect(UserStub.calledOnceWith({}, '-auth')).to.be.true
        })
        it('Should return list of all users', async () => {
            const   req         = {},
                    res         = {json: sandbox.stub()}
                    
            sandbox.stub(User, 'find').returns([{user: 'name'},{user: 'name_2'}])

            await getAll(req, res, next)

            expect(res.json.calledOnceWith([{user: 'name'},{user: 'name_2'}])).to.be.true
            
        })
        it('Should return error user not found if users empty', async () => {
            const   req         = {},
                    res         = { json: sandbox.stub() },
                    boomStub    = sandbox.stub(boom, 'notFound')

            sandbox.stub(User, 'find').returns([])

            await getAll(req, res, next)

            expect(res.json.called).to.be.false
            expect(boomStub.calledOnceWith('No users found.')).to.be.true

        })
        it('Should return error if server throws', async () => {

            const   req         = {},
                    res         = {},
                    boomStub    = sandbox.stub(boom, 'badImplementation')

            sandbox.stub(User, 'find').throws()

            await getAll(req, res, next)

            expect(boomStub.calledOnceWith('Something went wrong')).to.be.true
        })
    })
    
    describe('deleteUser()', () => {
        let next, sandbox
        beforeEach(() => {
            sandbox = sinon.createSandbox()
            next    = sandbox.spy()
        })
        afterEach(() => {
            sandbox.restore()
        })
        it('Should return error if user id is missing', async () => {
            const   req         = {},
                    res         = {},
                    boomStub    = sandbox.stub(boom, 'notAcceptable')
            
            await deleteUser(req, res, next)

            expect(next.calledOnce).to.be.true
            expect(boomStub.calledOnceWith('User id is missing.')).to.be.true
                
        })
        it('Should find user by id and remove', async () => {
            const   req         = { body: { id: '123' } },
                    res         = {},
                    UserStub    = sandbox.stub(User, 'findByIdAndRemove')
            
            await deleteUser(req, res, next)

            expect(UserStub.calledOnceWith(req.body.id)).to.be.true
        })
        it('Should return message on success', async () => {
            const   req         = { body: { id: '123' } },
                    res         = { json: sandbox.spy() }
                    
            sandbox.stub(User, 'findByIdAndRemove').returns(true)
            
            await deleteUser(req, res, next)

            expect(res.json.calledOnceWith({message: 'User deleted.'})).to.be.true
        })
        it('Should return message on error', async () => {
           
            const   req         = { body: { id: '123' } },
                    res         = { },
                    boomStub    = sandbox.stub(boom, 'notFound')
                    
            sandbox.stub(User, 'findByIdAndRemove').returns(false)
            
            await deleteUser(req, res, next)

            expect(boomStub.calledOnceWith('User not found.')).to.be.true
       
        })
        it('Should return error if server throws', async () => {

            const   req         = { body: { id: '123' } },
                    res         = { },
                    boomStub    = sandbox.stub(boom, 'badImplementation')
                    
            sandbox.stub(User, 'findByIdAndRemove').throws('some error')
            
            await deleteUser(req, res, next)

            expect(boomStub.calledOnceWith('Something went wrong')).to.be.true
        })
        
    })
    describe('updateUser()', () => {
        let next, sandbox, userStub
        beforeEach(() => {
            sandbox     = sinon.createSandbox()
            next        = sandbox.spy()
            userStub    = sandbox.stub(User, 'findByIdAndUpdate')
        })
        afterEach(() => {
            sandbox.restore()
        })
        it('Should delete role from updated user data for non-admin users', async () => {
            const   req = { payload: { id: '123', role: 'user' }, body: { user: { role: 'user' } } },
                    res = {}
            
            await updateUser(req, res, next)
            
            expect(userStub.calledOnceWith('123',{})).to.be.true
        })
        it('Should call user update method with current user id if user is not admin', async () => {
            const   req = { payload: { id: '123', role: 'user' }, body: { user: { role: 'user' } } },
                    res = {}

            await updateUser(req, res, next)
            
            expect(userStub.calledOnceWith('123')).to.be.true
        })
        it('Should call user update method with specified user id if user is admin', async () => {
            const  req = { payload: { id: '123', role: 'superuser' }, body: { user: { id: '321' } } },
                    res = {}

            await updateUser(req, res, next)
            
            expect(userStub.calledOnceWith('321')).to.be.true
        })
        it('Should return success message if user was successfully updated', async () => {
            const   req = { payload: { id: '123', role: 'superuser' }, body: { user: { id: '321' } } },
                    res = { json: sandbox.spy() }
            
            userStub.returns(true)

            await updateUser(req, res, next)
            
            expect(res.json.calledOnceWith({message: 'User updated'})).to.be.true
        })
        it('Should return error if user not found', async () => {
            const   req         = { payload: { id: '123', role: 'superuser' }, body: { user: { id: '321' } } },
                    res         = {},
                    boomStub    = sandbox.stub(boom, 'notFound')
            
            userStub.returns(false)

            await updateUser(req, res, next)
            
            expect(boomStub.calledOnceWith('User not found')).to.be.true
        })
        it('Should return error if server throws', async () => {
            const   req         = { payload: { id: '123', role: 'superuser' }, body: { user: { id: '321' } } },
                    res         = {},
                    boomStub    = sandbox.stub(boom, 'badImplementation')
            
            userStub.throws('error')

            await updateUser(req, res, next)
            
            expect(boomStub.calledOnceWith('Something went wrong')).to.be.true
        })

    })

    describe('userExists()', () => {
        let next, sandbox, userStub
        beforeEach(() => {
            sandbox     = sinon.createSandbox()
            next        = sandbox.spy()
            userStub    = sandbox.stub(User, 'countDocuments')
        })
        afterEach(() => {
            sandbox.restore()
        })
        
        it('Should count User documents with specificied email', async () => {

            const   req = { params: { email: 'test@test.com' } },
                    res = {}            
            
            await userExists(req, res, next)

            expect(userStub.calledOnceWith({"auth.local.email": "test@test.com"})).to.be.true
        })
        it('Should return true if user(s) exists', async () => {

            const   req = { params: { email: 'test@test.com' } },
                    res = { json: sandbox.spy() }
                    
            userStub.returns(1)
            
            await userExists(req, res, next)

            expect(res.json.calledOnceWith({userExists: true})).to.be.true
        })
        it('Should return false if user(s) do not exists', async () => {
            
            const   req = { params: { email: 'test@test.com' } },
                    res = { json: sandbox.spy() }
                    
            userStub.returns(0)
            
            await userExists(req, res, next)

            expect(res.json.calledOnceWith({userExists: false})).to.be.true
        })
        it('Should if server throws and error send 500', async () => {

            const   req         = { params: { email: 'test@test.com' } },
                    res         = {},
                    boomStub    = sandbox.stub(boom, 'badImplementation')
                    
            userStub.throws('error')
            
            await userExists(req, res, next)

            expect(boomStub.calledOnceWith('Something went wrong')).to.be.true
        })

    })


    after((done) => {
        delete mongoose.connection.models['User']
        return mongoose.connection.close(done)
    })
})


