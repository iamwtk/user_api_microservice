import 'babel-polyfill'
import mongoose         from 'mongoose'
import User             from '../models/model.user'
import sinon            from 'sinon'
import 'sinon-mongoose'
import chai             from 'chai'
import boom             from 'boom'
import { getSingle }    from './controller.user'

process.env.NODE_ENV    = 'test'
const expect            = chai.expect

describe('[USER_API] User Controller', () => {
    describe('getSingle', () => {

        let UserStub, next, BoomStub, sandbox

        beforeEach(() => {
            sandbox     = sinon.createSandbox()
            UserStub    = sandbox.stub(User, 'findById')            
            next        = sandbox.spy()
        })
        afterEach(() => {
            sandbox.restore()
        })
        describe('SUCCESS', ()=> {
            it('Should return single user from database', async () => {

                const req       = { payload: { id: '123456789' } }, 
                      res       = { json: sandbox.spy() },               
                      mockData  = { username: 'username', id: '123456789' }  

                UserStub.callsFake(() => mockData) 

                await getSingle(req, res, next)

                expect(next.notCalled).to.be.true                                   //checks if any error was dispatched
                expect(UserStub.calledOnce).to.be.true                              //User method called once       
                expect(res.json.calledOnceWith({user: {...mockData}})).to.be.true   //function returns user       
            
            })
        })
        describe('ERROR', ()=> { 
            it('Should return error if user not found', async () => {

                const req   = { payload: { id: '123456789' } }, 
                      res   = {}

                BoomStub    = sandbox.stub(boom, 'notFound')                

                UserStub.callsFake(() => null)

                await getSingle(req, res, next)

                expect(UserStub.calledOnce).to.be.true                              //checks if User method called
                expect(next.calledOnce).to.be.true                                  //Checks if callback function called
                expect(BoomStub.calledOnceWith('User not found')).to.be.true        //checks if callback with error handler with args was called
            
            })            
            it('Should return error if user id is not present', async () => {

                const req   = {}, 
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

                const req   = { payload: { id: '123456789' } },
                      res   = {}

                BoomStub    = sandbox.stub(boom, 'badImplementation')

                UserStub.callsFake(() => {throw new Error()})                       //Throw error after database call

                await getSingle(req, res, next)

                expect(UserStub.calledOnce).to.be.true                              //checks if User method called
                expect(next.calledOnce).to.be.true                                  //Checks if callback function called
                expect(BoomStub.calledOnceWith('Something went wrong')).to.be.true  //checks if callback with error handler with args was called

            })
        })
           
    })



    after((done) => {
        delete mongoose.connection.models['User']
        return mongoose.connection.close(done)
    })
})


