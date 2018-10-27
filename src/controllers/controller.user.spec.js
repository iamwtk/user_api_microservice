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
    deleteUser
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
            next = sandbox.spy()
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


    after((done) => {
        delete mongoose.connection.models['User']
        return mongoose.connection.close(done)
    })
})


