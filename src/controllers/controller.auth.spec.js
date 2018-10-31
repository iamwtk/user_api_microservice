import 'babel-polyfill'
import passport         from 'passport'
import mongoose         from 'mongoose'
import User             from '../models/model.user'
import sinon            from 'sinon'
import 'sinon-mongoose'
import chai             from 'chai'
import boom             from 'boom'
import {
    signup,   
    login
}                       from './controller.auth'


process.env.NODE_ENV    = 'test'
const expect            = chai.expect

describe('[USER_API] Auth Controller', () => {
    /**
     * ./controller.user signup()
     */
    describe('signup()', () => {

        let next, BoomStub, sandbox
        const body = {user: {auth: {local: {
                                        email: '',
                                        password: '',
                                        password_2: ''
                                    }}}}

        beforeEach(() => {
            sandbox     = sinon.createSandbox()                        
            next        = sandbox.spy()
        })
        afterEach(() => {
            sandbox.restore()           
        })

        describe.only('Success', () => {

            before(() => {
                body.user.auth.local = { password: '1aaaBB', password_2: '1aaaBB', email:'test@test.com' }
            })            

            it('Should create new instance of User with request data', async () => {
                const   req             = { body },
                        res             = {},
                        local           = { password: '1aaaBB', password_2: '1aaaBB'},
                        constructorStub = sandbox.stub(User.prototype, 'constructor')                
                               
                const UserStub = sandbox.stub(User.prototype, 'save').returns(true)
                
                await signup(req, res, next)
                console.log(constructorStub.getCalls())
                expect(constructorStub.calledOnceWith({...req.body.user})).to.be.true

            })
            it('Should set password', async () => {
                const   req             = { body },
                        res             = {},
                        local           = { password: '1aaaBB', password_2: '1aaaBB'},
                        setPasswordStub = sandbox.stub(User.prototype, 'setPassword')                
                               
                req.body.user.auth.local    = {...local}
                
                await signup(req, res, next)

                expect(setPasswordStub.calledOnceWith('1aaaBB')).to.be.true

            })
            it('Should save user', async () => {
                const   req             = { body },
                        res             = {},
                        local           = { password: '1aaaBB', password_2: '1aaaBB', email: 'test@test.com'},
                        saveUserStub    = sandbox.stub(User.prototype, 'save').returns(true)               
                
                req.body.user.auth.local    = {...local} 

                await signup(req, res, next)

                expect(saveUserStub.calledOnce).to.be.true
            })
            it('Should return json user object', async () => {
                const   req             = { body },
                        res             = { json: sandbox.stub() },
                        local           = { password: '1aaaBB', password_2: '1aaaBB', email: 'test@test.com'},
                        toAuthJSONStub  = sandbox.stub(User.prototype, 'toAuthJSON').returns({token: '11111'}),
                        saveUserStub = sandbox.stub(User.prototype, 'save').returns(true)
                
                req.body.user.auth.local    = {...local} 
                
                await signup(req, res, next)                

                expect(toAuthJSONStub.calledOnce).to.be.true
                expect(res.json.calledOnceWith({user: {token: '11111'}})).to.be.true
            })
        })  
              
        describe('Error', () => {
            let UserStub
            beforeEach(() => {
                UserStub = sandbox.stub(User.prototype, 'save')
            })

            it('Should return error if user object is missing', async () => {

                const   req = { body: {} },
                        res = {}

                BoomStub    = sandbox.stub(boom, 'unauthorized')

                await signup(req, res, next)

                expect(next.calledOnce).to.be.true
                expect(UserStub.called).to.be.false                                     //Checks if callback function called
                expect(BoomStub.calledOnceWith('No user data received.')).to.be.true    //checks if callback with error handler with args was called

            })

            it('Should return error if passwords do not match', async () => {

                const   req     = { body },                            
                        res     = {},
                        local   = { password: '123', password_2: '321'}
                
                               
                req.body.user.auth.local    = {...local}                
                BoomStub                    = sandbox.stub(boom, 'unauthorized')
                        
                await signup(req, res, next)
                
                expect(next.calledOnce).to.be.true                              //checks if any error was dispatched
                expect(UserStub.called).to.be.false                             //User method called once with user id       
                expect(BoomStub
                        .calledOnceWith('Passwords do not match.')).to.be.true  //error handler called with specific message
            
            })
            it('Should return error if password not valid', async () => {

                const   req     = { body },
                        res     = {},
                        val     = ['min', 'uppercase', 'digits'],
                        local   = { password: 'abc', password_2: 'abc'}                
                               
                req.body.user.auth.local    = {...local} 
                BoomStub                    = sandbox.stub(boom, 'notAcceptable')
                        
                await signup(req, res, next)
                
                expect(next.calledOnce).to.be.true                              //checks if any error was dispatched
                expect(UserStub.called).to.be.false                             //User method called once with user id       
                expect(BoomStub
                        .calledOnceWith('Invalid password.', val)).to.be.true //error handler called with specific message
            

            })
            it('Should return validation error if mongo throws', async () => {

                const   req             = { body },
                        res             = {json: sandbox.stub()},
                        local           = { password: '1aaaBB', password_2: '1aaaBB'}                                        
                               
                req.body.user.auth.local    = {...local}
                BoomStub                    = sandbox.stub(boom, 'unauthorized')

                UserStub.throws({name: 'ValidationError', message: 'test'})
                await signup(req, res, next)
                
                expect(UserStub.called).to.be.true
                expect(res.json.called).to.be.false
                expect(BoomStub.calledOnceWith('test')).to.be.true

            })            
        })
    })   

    describe.skip('login()', () => {
        let sandbox, passportStub
        beforeEach(() => {
            sandbox         = sinon.createSandbox()
            passportStub    = sandbox.stub(passport, 'authenticate')
        })
        afterEach(() => {
            sandbox.restore()
        })
        it('Should call passport authenticate method', () => {
            const   req     = {},
                    res     = {},
                    next    = function(){}
            
            passportStub.returns(() => {})

            login(req, res, next)  

            expect(passportStub.calledOnceWith('local')).to.be.true

                
        })
        it('Should return error if authentication fails', () => {
            const   req     = {},
                    res     = {},
                    next    = sandbox.stub()
            
            passportStub.throws('error')

            login(req, res, next) 
            
            expect(next.calledOnce).to.be.true

            
        })
        it('Should return user if authentication succeeded', () => {})
        it('Should set token on user object', () => {})
        it('Should return user auth object', () => {})
    })



    after((done) => {
        delete mongoose.connection.models['User']
        return mongoose.connection.close(done)
    })
})


