console.log('settings.js');

var App = Em.Application.create({
    ready: function () { console.log('ready'); App.init()},
});

App.init = function() {    
    $.ajax({
	url: "radio/radio",  
	type: "GET",  
	dataType: "json",  
	contentType: "application/json",  
	success: function(data) {
	    App.radio.set('firmware', data.firmware);
	    App.radio.set('resetcmd', data.resetcmd);
	}
    });  
    $.ajax({
	url: "radio/tunslip",  
	type: "GET",  
	dataType: "json",  
	contentType: "application/json",  
	success: function(data) {
	    App.tunslip.set('address', data.address);
	    App.tunslip.set('device', data.device);
	    App.tunslip.set('baud', data.baud);
	}
    });  

    App.mainView.append();

};


Ember.Handlebars.registerHelper('trigger', function (evtName, options) {

    var options = arguments[arguments.length - 1],
    hash = options.hash,
    view = options.data.view,
    target;

    view = view.get('concreteView');

    if (hash.target) {
        target = Ember.Handlebars.get(this, hash.target, options);
    } else {
        target = view;
    }

    Ember.run.next(function () {
        target.trigger(evtName);
    });
});


App.mainViewClass = Ember.View.extend({
    templateName: 'main',
    doToolTips: function () {
	$('#tunslip-tip').qtip({content: "The fallback address will be use if an ipv6 address cannot be established"});
    }
});

App.mainView = App.mainViewClass.create();

App.radio = Ember.Object.create ({
    channels: [11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],
    newChannel: null,
    oldChannel: null,
    firmware: null,
    resetcmd: null,
    changeChannel: function () {
	console.log("change channel");
	if (this.get('newChannel') != this.get('oldChannel')) {
	    console.log("setting new channel")
	    $.ajax({
		url: "radio/channel",
		type: "POST",
		context: this,
		contentType: "application/json",
		data: JSON.stringify({
		    "channel": this.get('newChannel'),
		}),
		success: function(data) {
		    this.set('oldChannel', this.get('newChannel'));
		}
	    });
	}	
    },
    channelChangeOk: function () {
	return this.get('newChannel') != this.get('oldChannel');
    }.property('newChannel', 'oldChannel'),
    save: function() {
	$.ajax({
	    url: "radio/radio",
	    type: "POST",
	    dataType: "json",
	    contentType: "application/json",
	    data: JSON.stringify({
		"firmware": this.get('firmware'),
		"resetcmd": this.get('resetcmd')
	    }),
	    success: function(data) {
	    }
	});
    },
    reload: function() {
	console.log('reload');
	$.ajax({
	    url: "radio/reload",
	    type: "POST",
	    dataType: "json",
	    contentType: "application/json",
	    data: null,
	    success: function(data) {
	    }
	});
    }
});

App.tunslip = Ember.Object.create ({
    address: null,
    device: null,
    baud: null,
    save: function() {
	$.ajax({
	    url: "radio/tunslip",
	    type: "POST",
	    dataType: "json",
	    contentType: "application/json",
	    data: JSON.stringify({
		"address": this.get('address'),
		"device": this.get('device'),
		"baud": this.get('baud')
	    }),
	    success: function(data) {
	    }
	});
    }
});

App.preset = Ember.Object.create ({
    br12: function () {
	App.radio.set('resetcmd','mcreset');
	App.tunslip.set('address','aaaa::1/64');
	App.tunslip.set('device','/dev/ttyS0');
	App.tunslip.set('baud','115200');
	App.radio.save();
	App.tunslip.save();
    },
    econotag: function () {
	App.radio.set('resetcmd','bbmc -l redbee-econotag reset');
	App.tunslip.set('address','aaaa::1/64');
	App.tunslip.set('device','/dev/ttyUSB1');
	App.tunslip.set('baud','115200');
	App.radio.save();
	App.tunslip.save();
    },
    cooja: function () {
	App.radio.set('resetcmd','');
	App.tunslip.set('address','aaaa::1/64');
	App.tunslip.set('device','');
	App.tunslip.set('baud','');
	App.radio.save();
	App.tunslip.save();
    },
});