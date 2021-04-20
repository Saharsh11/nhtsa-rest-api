const assert = require('assert')
const expect = require('chai').expect
const request = require('supertest')

const app = require('../index')

describe('Unit Tests for calls without parameters', function() {
    
    it('Should open search.html', function(){
        request(app).get('/')
        .expect(200)
        .end(function(err,res){
            if(err) throw err
        })
    })
    
    it('Should Fetch all manufacturers', function() {
        request(app).get('/manufacturers')
        .expect('Content-Type', /json/)
        .then(function(response){
            assert.strictEqual(response.status, 200)
        })
    })

    it('Should not Fetch all manufacturers', function() {
        request(app).get('/manufacturer')
        .expect('Content-Type', /json/)
        .then(function(response){
            assert.strictEqual(response.status, 200)
        })
    })
})

describe('Unit Tests for calls with parameters', function() {

    it('test for get functionality for /manufacturers/:name', function(done) {
        request(app)
          .get('/manufacturers/honda')
          .expect(200, done());
    })

    it('true test for get functionality for /manufacturers/vin/:vin_number', function(done) {
        request(app)
          .get('/manufacturers/vin/3N1AB6AP7BL729215')
          .expect(200, done());
    })

    it('false test for get functionality for /manufacturers/vin/:vin_number', function(done) {
        request(app)
          .get('/manufacturers/vin/3N1AB6AP7BL729212')
          .expect(400, done());
    })

    it('false test for get functionality for /manufacturers/vin/:vin_number', function(done) {
        request(app)
          .get('/manufacturers/vin/ ')
          .expect(400, done());
    })

    it('true test for get functionality for /manufacturers/Validate_vin/:vin', function(done) {
        request(app)
          .get('/manufacturers/Validate_vin/3N1AB6AP7BL729215')
          .expect(200, done());
    })

    it('false test for get functionality for /manufacturers/Validate_vin/:vin', function(done) {
        request(app)
          .get('/manufacturers/Validate_vin/ ')
          .expect(400, done());
    })

    it('true test for get functionality for /manufacturers/Validate_vin/:vin', function(done) {
        request(app)
          .get('/manufacturers/search/3N1AB6AP7BL729215')
          .expect(400, done());
    })
})