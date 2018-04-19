//////////////////////////////
//THIS CONTAINS THE JAVASCRIPT
//////////////////////////////

var upi = makeid();
var count = 0; //For keeping track of how long the process has run for
var timeout = 450;//How many steps to run for
var delay = 100; //How many ms per step
var mu = 20
var lambda = .1
var sigma = 5
var x0 = 0
var intervention = 'none';
var stage_off = false;

var tmp = makeid();
var trial_data = {setup:[], x:[], y:[],z:[],xy:[],xz:[],yx:[],yz:[],zx:[],zy:[], interventions:[], upi:tmp};

var judge_vals = ["negative","none","positive"];

var networks = [
//  [xy,xz,yx,yz,zx,zy]
	[ 1, 0, 0, 0, 0, 0], //       single cause (+): x>y
	[ 0, 0, 0, 0, 0,-1], //       single cause (-): z>y
	[ 0, 0, 0, 1, 1, 0], //            chain (+,+): y>z, z>x
	[ 0,-1, 1, 0, 0, 0], //            chain (+,-): y>x, x>z
	[-1, 0, 0,-1, 0, 0], //            chain (-,-): x>y, y>z
	[ 0, 0, 1, 0, 1, 1], //simpson paradox (+,+,+): z>x, z>y, y>x
	[ 0, 1, 1,-1, 0, 0], //simpson paradox (+,+,-): y>x, x>z, y>z
	[ 1, 1, 0, 0, 0, 0], //     common cause (+,+): x>y, x>z
	[ 0, 0,-1, 1, 0, 0], //     common cause (+,-): y>x, y>z
	[ 0, 0, 0, 0,-1,-1], //     common cause (-,-): z>x, z>y
	[ 0, 0, 1, 0, 1, 0], //    common effect (+,+): y>x, z>x
	[-1, 0, 0, 0, 0, 1], //    common effect (+,-): x>y, z>y
	[ 0, 0, 0, 1, 0, 1], //    feedback loop (+,+): y>z, z>y
	[ 0, 1, 0, 0,-1, 0], //    feedback loop (+,-): x>z, z>x
	[-1, 0,-1, 0, 0, 0], //    feedback loop (-,-): x>y, y>x
	[ 0, 0,-1,-1, 0,-1], // FL w/ offshoot (-,-;-): y>z, z>y, y>x
	[ 1,-1, 1, 0, 0, 0], // FL w/ offshoot (+,+;-): x>y, y>x, x>z
	[ 0, 1, 0, 0,-1, 1], // FL w/ offshoot (+,-;+): x>z, z>x, z>y
	[ 0, 1, 0, 1, 0, 1], //  FL w/ feed-in (+,+;+): y>z, z>y, x>z
	[-1, 0, 1, 0, 0, 1], //  FL w/ feed-in (-,+;+): x>y, y>x, z>y
	[ 0, 1,-1, 0, 1, 0], //  FL w/ feed-in (+,+;-): x>z, z>x, y>x
	[ 1,-1, 1, 0, 0, 1], //  FL w/ chain (+,+;-,+): x>y, y>x, x>z, z>y <=== really hard
	[ 1,-1, 0, 1,-1, 0]  //  FL w/ chain (-,-;+,+): x>z, z>x, x>y, y>z <=== really hard
  //[ 5, 6, 7, 5, 4, 7]  // counts of positive relationships
  //[ 4, 4, 4, 3, 4, 3]  // counts of negative relationships
];



function InitialiseBeta()
{
	$('#manual_panel').hide();

	rand_net_ix = Math.floor(Math.random(1) * networks.length);
	console.log('Network: ', rand_net_ix, ':', networks[rand_net_ix]);

	betas = networks[rand_net_ix];
	$("#beta1_set").val(betas[0]);
	$("#beta2_set").val(betas[1]);
	$("#beta3_set").val(betas[2]);
	$("#beta4_set").val(betas[3]);
	$("#beta5_set").val(betas[4]);
	$("#beta6_set").val(betas[5]);
}

function SetBeta()
{ 
console.log('setbeta', betas);
   betas = [Number($(beta1_set).val()), Number($(beta2_set).val()), Number($(beta3_set).val()),
   Number($(beta4_set).val()), Number($(beta5_set).val()), Number($(beta6_set).val())];         
}

//For updating the text box next to each slider to the sliders' value
function updateOutput(el, val) {
  el.textContent = val;
}

$( function() {
	var handle = $( "#custom-handlex" );
    $( "#slidex" ).slider({
      orientation: "vertical",
      animate: true,
      range: "min",
      min: -100000,
      max: 100000,
      value: 0,
      create: function() {
        handle.text( Math.round($( this ).slider( "value" )/1000) );
      },
      slide: function( event, ui ) {
      	handle.text(Math.round(ui.value/1000));
      }
    });
    //Functionality to stop the controlled sliders jittering
    $("#slidex").mousedown(function() {
    	intervention = 'x';
	});
  } );


$( function() {
	var handle = $( "#custom-handley" );
    $( "#slidey" ).slider({
      orientation: "vertical",
      animate: true,
      range: "min",
      min: -100000,
      max: 100000,
      value: 0,
      create: function() {
        handle.text( $( this ).slider( "value" ) );
      },
      slide: function( event, ui ) {
      	handle.text(Math.round(ui.value/1000));
      }
    });
    //Functionality to stop the controlled sliders jittering
    $("#slidey").mousedown(function() {
    	intervention = 'y';
	});
  } );

$( function() {
	var handle = $( "#custom-handlez" );
    $( "#slidez" ).slider({
      orientation: "vertical",
      animate: true,
      range: "min",
      min: -100000,
      max: 100000,
      value: 0,
      create: function() {
        handle.text( $( this ).slider( "value" ) );
      },
      slide: function( event, ui ) {
      	handle.text(Math.round(ui.value/1000));
      }
    });
    //Functionality to stop the controlled sliders jittering
    $("#slidez").mousedown(function() {
    	intervention = 'z';
	});
  } );


////////////////////////
// Judgment sliders
////////////////////////
$( function() {
	var handle = $( "#custom-judgexy" );
    $( "#judgexy" ).slider({
      orientation: "horizontal",
      range: "min",
      min: -1,
      max: 1,
      value: 0,
      create: function() {
        handle.text( judge_vals[ $( this ).slider( "value" )+1 ] );
      },
      slide: function( event, ui ) {
      	handle.text(judge_vals[ui.value+1]);
      }
    });
    //Functionality to stop the controlled sliders jittering
    $("#judgexy").mousedown(function() {
    	intervention = 'xy';
	});
  } );

$( function() {
	var handle = $( "#custom-judgexz" );
    $( "#judgexz" ).slider({
      orientation: "horizontal",
      range: "min",
      min: -1,
      max: 1,
      value: 0,
      create: function() {
        handle.text( judge_vals[ $( this ).slider( "value" )+1 ] );
      },
      slide: function( event, ui ) {
      	handle.text(judge_vals[ui.value+1]);
      }
    });
    //Functionality to stop the controlled sliders jittering
    $("#judgexz").mousedown(function() {
    	intervention = 'xz';
	});
  } );

$( function() {
	var handle = $( "#custom-judgeyx" );
    $( "#judgeyx" ).slider({
      orientation: "horizontal",
      range: "min",
      min: -1,
      max: 1,
      value: 0,
      create: function() {
        handle.text( judge_vals[ $( this ).slider( "value" )+1 ] );
      },
      slide: function( event, ui ) {
      	handle.text(judge_vals[ui.value+1]);
      }
    });
    //Functionality to stop the controlled sliders jittering
    $("#judgeyx").mousedown(function() {
    	intervention = 'yx';
	});
  } );

$( function() {
	var handle = $( "#custom-judgeyz" );
    $( "#judgeyz" ).slider({
      orientation: "horizontal",
      range: "min",
      min: -1,
      max: 1,
      value: 0,
      create: function() {
        handle.text( judge_vals[ $( this ).slider( "value" )+1 ] );
      },
      slide: function( event, ui ) {
      	handle.text(judge_vals[ui.value+1]);
      }
    });
    //Functionality to stop the controlled sliders jittering
    $("#judgeyz").mousedown(function() {
    	intervention = 'yz';
	});
  } );

$( function() {
	var handle = $( "#custom-judgezx" );
    $( "#judgezx" ).slider({
      orientation: "horizontal",
      range: "min",
      min: -1,
      max: 1,
      value: 0,
      create: function() {
        handle.text( judge_vals[ $( this ).slider( "value" )+1 ] );
      },
      slide: function( event, ui ) {
      	handle.text(judge_vals[ui.value+1]);
      }
    });
    //Functionality to stop the controlled sliders jittering
    $("#judgezx").mousedown(function() {
    	intervention = 'zx';
	});
  } );

$( function() {
	var handle = $( "#custom-judgezy" );
    $( "#judgezy" ).slider({
      orientation: "horizontal",
      range: "min",
      min: -1,
      max: 1,
      value: 0,
      create: function() {
        handle.text( judge_vals[ $( this ).slider( "value" )+1 ]);
      },
      slide: function( event, ui ) {
      	handle.text(judge_vals[ui.value+1]);
      }
    });
    //Functionality to stop the controlled sliders jittering
    $("#judgezy").mousedown(function() {
    	intervention = 'zy';
	});
  } );



function Run(betas)
{
	$('#startBtn').attr('disabled', true);
	$('#stopBtn').attr('disabled', false);

	count = 0;
	
	trial_data.setup = [betas[0], betas[1], betas[2], betas[3], betas[4], betas[5], lambda, sigma, mu];

	console.log('running with beta1: ', betas[0], ' 2: ', betas[1], ' 3:', betas[2],
	             ' 4: ', betas[3], ' 5:', betas[4], ' 6: ', betas[5], '\n');

	process = setInterval(Step, delay, betas);
}



function Step(betas)
{
	count = count+1;

	var cur_valx = $('#slidex').slider("value")/1000;
  	var cur_valy = $('#slidey').slider("value")/1000;
	var cur_valz = $('#slidez').slider("value")/1000;
	var cur_valxy = $('#judgexy').slider("value");
	var cur_valxz = $('#judgexz').slider("value");
	var cur_valyx = $('#judgeyx').slider("value");
	var cur_valyz = $('#judgeyz').slider("value");
	var cur_valzx = $('#judgezx').slider("value");
	var cur_valzy = $('#judgezy').slider("value");

		
	if (intervention!=='x')
	{
		var step_x = OU(cur_valx,betas[2]*cur_valy + betas[4]*cur_valz,lambda,sigma, beta=1)*1000;
		// Truncate the values at the limits
		if (step_x>100000)
		{
			step_x  = 100000;
		} else if (step_x< (-100000))
		{
			step_x = -100000;
		}
		$('#slidex').slider("value", step_x);
		$('#custom-handlex').text( Math.round(step_x/1000) );
	}

	if (intervention!=='y')
	{
		var step_y = OU(cur_valy,betas[0]*cur_valx + betas[5]*cur_valz,lambda,sigma, beta=1)*1000;
		// Truncate the values at the limits
		if (step_y>100000)
		{
			step_y  = 100000;
		} else if (step_y< (-100000))
		{
			step_y = -100000;
		}
		$('#slidey').slider("value", step_y);
		$('#custom-handley').text( Math.round(step_y/1000) );
	}

	if (intervention!=='z')
	{
		var step_z = OU(cur_valz,betas[1]*cur_valx + betas[3]*cur_valy,lambda,sigma, beta=1)*1000;
				// Truncate the values at the limits
		if (step_z>100000)
		{
			step_z  = 100000
		} else if (step_z< -100000)
		{
			step_z = -100000
		}
		$('#slidez').slider("value", step_z);
		$('#custom-handlez').text( Math.round(step_z/1000) );
	}
	
	//Save the data from this frame
	trial_data.x.push(cur_valx);
	trial_data.y.push(cur_valy);
	trial_data.z.push(cur_valz);
	// trial_data.xy.push(cur_valxy);
	// trial_data.xz.push(cur_valxz);
	// trial_data.yx.push(cur_valyx);
	// trial_data.yz.push(cur_valyz);
	// trial_data.zx.push(cur_valzx);
	// trial_data.zy.push(cur_valzy);
	
	trial_data.interventions.push(intervention);

	if (stage_off===true)
	{
		stage_off = false;
		intervention = 'none';
	}

	//Print out what's going on
	if (count % 5 === 0) 
	{
		console.log('step: ', count, 'cur_vals: ', cur_valx, cur_valy, cur_valz,
		            'steps: ', step_x/1000, step_y/1000, step_z/1000,
		            'intervention: ', intervention, '\n');
	}

	if ((timeout-count) % 10 === 0)
	{
		//document.getElementById("countdown").innerHTML = (timeout-count)/10 + " seconds remaining";
	}

	//Stop at the end
	if (count>timeout)
	{
		Stop();
	}
}

function OU(x0, cause, lambda, sigma, beta) {
	//NOTE: the "cause" parameter can be a number if want to track 
	//to that specific number, doesn't have to be another series.
	return (x0 + lambda*(beta*cause-x0) + sigma*myNorm())		
}

function Stop()
{
	$('#startBtn').attr('disabled', false);
	console.log('stopping!', trial_data);
	clearInterval(process);
	// SaveData(trial_data);
}

function ShowHide()
{
	console.log('show/hide');
	if ($('#manual_panel').is(":visible"))
	{
	 	$('#manual_panel').hide();
	} else {
		$('#manual_panel').show();
	}
}
//Generates a standard normal using Box-Mueller transformation
function myNorm() 
{
    var x1, x2, rad;
     do {
        x1 = 2 * Math.random() - 1;
        x2 = 2 * Math.random() - 1;
        rad = x1 * x1 + x2 * x2;
    } while(rad >= 1 || rad == 0);
     var c = Math.sqrt(-2 * Math.log(rad) / rad);
     return (x1 * c);
};

// Interventions end with a mouse up but not necessarily still over the slider
// But the minimum length of an intervention should still be one frame
$(document).mouseup(function() {
		console.log('mouse up on body');
		
		if (intervention!='none')
		{
		    stage_off = true;
		}
	});


function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
