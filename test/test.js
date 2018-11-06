describe('#app.stop', function() {
    before(function(){
        app.play();
    })
    it('should return to initial state', function(done) {
        setTimeout(function(){
            app.stop();
            chai.expect(state.playing).to.be.false;
            chai.expect(state.p).to.be.equal(0);
            done();
        },60000/beat.bpm)
    })
})

describe('#play button', function() {
    before(function(){
        app.get("play").click();
    })
    it('should play and pause correct', function(done) {
        setTimeout(function(){
            chai.expect(state.playing).to.be.true;
            app.get("play").click();
            chai.expect(state.playing).to.be.false;
            chai.expect(state.p).to.be.equal(3);
            app.get("stop").click();
            chai.expect(state.p).to.be.equal(0);
            done();
        },60000/beat.bpm)
    })
})

describe("#change bpm", function() {
    before(function(){
        app.get("play").click();
    });
    it("should change volume", function(done) {
        setTimeout(function(){
            app.get("mute").click();
            chai.expect(beat.totalVolume).to.be.equal(0);
            done();
        },60000/beat.bpm)
    });
    after(app.stop);
})