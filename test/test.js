// let chai = require("chai");
// let chaiAsPromised = require("chai-as-promised");
// let expect = require('chai').expect;
// chai.use(chaiAsPromised);

describe('#app.stop', function() {
    it('should return to initial state', function() {
        // app.play();
        state.p++;
        app.stop();
        chai.expect(state.playing).to.be.false;
        chai.expect(state.p).to.be.equal(0);
    })
})
describe('#recording', function() {
    it('keyboard record to beat pad', function() {
        app.play();
        document.getElementById("drumPad1").click();
        chai.expect(state.playing).to.be.true;
        chai.expect(dom.padList[state.p][1]).to.be.true;
    })
})

// describe('#stop', function(){
//     it('should return to initial state', function() {
//         app.stop();
//         chai.assert.equal(state.playing, false);
//         chai.assert.equal(state.p, 0);
//     })
// })

// let assert = require('assert');
// describe('Array', function() {
//     describe('#indexOf()', function() {
//         it('should return -1 when the value is not present', function() {
//             assert.equal([1,2,3].indexOf(4), -1);
//         });
//     });
// });