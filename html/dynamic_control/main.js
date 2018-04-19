//////////////////////////////////////////
//THIS CONTAINS THE JAVASCRIPT FOR A TRIAL
//////////////////////////////////////////


var count = 0; //For keeping track of how long the process has run for
var timeout = 200;//How many steps to run for (5 steps per second)
var delay = 100; //How many ms per step
var mu = 20;
var lambda = .1;
var sigma = 5;
var x0 = 0;
var intervention = 'none';
var stage_off = false;
var trial_data = {};
var judge_vals = ["inverted","none","regular"];
var the_process;
var score = 0; //Participant score
var int_state = 0;
var target_region = [10,70]; //Upper percentage of target region
var rand_target = Math.floor(Math.random(1));
var phase = 0;

var networks = [
					  //[xy,xz,yx,yz,zx,zy]
    {"id":[0],  "betas":[ 1, 0, 0, 0, 0, 0]}, //direct positive
    {"id":[1],  "betas":[-1, 0, 0, 0, 0, 0]}, //direct negative
    {"id":[2],  "betas":[ 0,-1, 0, 0, 0, 1]}, //neg chain
    {"id":[3],  "betas":[ 0,-1, 0, 0, 0,-1]}, //pos chain
    {"id":[4],  "betas":[ 1, 1, 0, 0, 0,-1]}, //simpsons paradox
    {"id":[5],  "betas":[-1,-1, 0, 0, 0, 1]}, //simpsons paradox (pos feedback loop)
    {"id":[6],  "betas":[ 1, 0, 0,-1, 0,-1]}, //direct w/ feedback loop
    {"id":[7],  "betas":[-1, 0, 0, 1, 0,-1]}, //direct w/ oscillation
    {"id":[8],  "betas":[ 0, 1, 0, 1, 0, 1]}, //indirect w/ feedback loop
    {"id":[9],  "betas":[ 0, 1, 0,-1, 0, 1]}, //indirect w/ oscillation
    {"id":[10], "betas":[-1,-1, 0,-1, 0,-1]}, //complex w/ feedback
    {"id":[11], "betas":[ 1, 1, 0, 1, 0,-1]}  //complex w/ oscillation
    ]


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

    function InitialiseBeta()
    {
    	$('#manual_panel').hide();
    	$("#green").hide();

    	rand_net_ix = Math.floor(Math.random(1) * networks.length);
    	console.log('Network: ', rand_net_ix, ':', networks[rand_net_ix].betas);

    	betas = networks[rand_net_ix].betas;
    	$("#beta1_set").val(betas[0]);
    	$("#beta2_set").val(betas[1]);
    	$("#beta3_set").val(betas[2]);
    	$("#beta4_set").val(betas[3]);
    	$("#beta5_set").val(betas[4]);
    	$("#beta6_set").val(betas[5]);

    	$("#stage-start").click(function () {
    		Run(betas, phase);
    		$('#stage-start').prop('disabled', true);
    	});
    	$("#popup").click(function () {
    		console.log('got here');
			PhaseTwo();
			$("#popup").hide();
		});
    }

    function SetBeta()
    { 
    	console.log('setbeta', betas);
    	betas = [Number($(beta1_set).val()), Number($(beta2_set).val()), Number($(beta3_set).val()),
    	Number($(beta4_set).val()), Number($(beta5_set).val()), Number($(beta6_set).val())];         
    }

    document.addEventListener("keydown", function(event) {
   //console.log(event.key);
   if (event.key=='o')
   {
   	int_state = 1;
   } else if (event.key=='k')
   {
   	int_state = 2;
   } else if (event.key=='m')
   {
   	int_state = 3;
   } else {
   	int_state = 0;
   }
   $('#custom-handlex').css({color:'blue'})
});

document.addEventListener("keyup", function(event) {
	int_state = 0;
	$('#custom-handlex').css({color:'black'})
});

// // Update the count down every 1 second
var countdown_timer = setInterval(function() {
    var now = Date.parse(new Date());
    var trial_duration = timeout/10;//Timeout in seconds
    var deadline = new Date(now + trial_duration*60*1000);
    var distance = deadline - now;
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
}, 1000);

//For updating the text box next to each slider to the sliders' value
function updateOutput(el, val) {
	el.textContent = val;
}

function Run(betas, cur_phase)
{
	$( function() {
		var handle = $( "#custom-handlex" );
		$( "#slidex" ).slider({
			orientation: "vertical",
			animate: true,
			range: "none",
			min: -100000,
			max: 100000,
			value: 0,
			disabled: false,
			create: function() {
				handle.text( Math.round($( this ).slider( "value" )/1000) );
			},
			slide: function( event, ui ) {
				return false;
      	//handle.text(Math.round(ui.value/1000));
      }
  });
    //Functionality to stop the controlled sliders jittering
    $("#slidex").mousedown(function() {
    	return false;
    });
} );

	$( function() {
		var handle = $( "#custom-handley" );
		$( "#slidey" ).slider({
			orientation: "vertical",
			animate: true,
			range: "none",
			min: -100000,
			max: 100000,
			value: 0,
			alpha: 0.5,
			disabled: false,
			create: function() {
				handle.text( $( this ).slider( "value" ) );
			},
			slide: function( event, ui ) {
				return false;
      	//handle.text(Math.round(ui.value/1000));
      }
  });
    //Functionality to stop the controlled sliders jittering
    $("#slidey").mousedown(function() {
    	return false;
    });
} );

	$( function() {
		var handle = $( "#custom-handlez" );
		$( "#slidez" ).slider({
			orientation: "vertical",
			animate: true,
			range: "none",
			min: -100000,
			max: 100000,
			value: 0,
			disabled: false,
			create: function() {
				handle.text( $( this ).slider( "value" ) );
			},
			slide: function( event, ui ) {
				return false;
      	//handle.text(Math.round(ui.value/1000));
      }
  });
    //Functionality to stop the controlled sliders jittering
    $("#slidez").mousedown(function() {
    	return false;
    });
} );

	// $("#green").css({visibility:'visible'});
	$("#green").show();
	
	count = 0;
	score = 0;
	trial_data = {setup:{"lambda":lambda, "sigma":sigma, "mu":mu},
	x:[], y:[], z:[], interventions:[], score:[], target_max:[], target_min:[]};

	console.log('running with beta1(xy): ', betas[0], ' 2(xz): ', betas[1], ' 3(yx):', betas[2],
	            ' 4(yz): ', betas[3], ' 5(zx):', betas[4], ' 6(zy): ', betas[5], '\n');

	the_process = setInterval(Step, delay, betas, cur_phase);
}



function Step(betas, cur_phase)
{
	count = count+1;

	//Get the control slider colored the right way
	$('#slidex').css({background:'gray'})

	// getting the outputted values of the sliders from the last trial
	var cur_valx = $('#slidex').slider("value")/1000;
	var cur_valy = $('#slidey').slider("value")/1000;
	var cur_valz = $('#slidez').slider("value")/1000;

	// setting the top of the reward slider and converting that into values
	$('#green').css({top:target_region[rand_target] + '%'})
	var target_max = 100 - (2*target_region[rand_target]);
	var target_min = target_max - 40; // bad code, as long as height is set to 20% this is fine

	if (intervention!=='x')
	{
		//Enabling arrow clicks
		if (int_state==0)
		{ //If no button click, let it move according to the OU process
			var step_x = OU(cur_valx,betas[2]*cur_valy + betas[4]*cur_valz,lambda,sigma)*1000;
		} else if (int_state==1)
		{ //If click 'o', add 10
		var step_x = cur_valx*1000 + 10000;
	} else if (int_state==2)
		{ //If click 'k', hold at current val
		var step_x = cur_valx*1000;
	} else if (int_state==3)
		{ //If click 'm', subtract 10
		var step_x = cur_valx*1000 - 10000;
	}

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
		var step_y = OU(cur_valy,betas[0]*cur_valx + betas[5]*cur_valz,lambda,sigma)*1000;
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
		var step_z = OU(cur_valz,betas[1]*cur_valx + betas[3]*cur_valy,lambda,sigma)*1000;
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

	//Adding to the score if it's within the correct range
	if (cur_valy <= target_max && cur_valy >= target_min)
	{
		score++;
	}
	document.getElementById("score_display").innerHTML = "Score: $" + score/100;

	//Save the data from this frame
	trial_data.x.push(cur_valx);
	trial_data.y.push(cur_valy);
	trial_data.z.push(cur_valz);
	trial_data.interventions.push(int_state);
	trial_data.score.push(score);
	trial_data.target_max.push(target_max);
	trial_data.target_min.push(target_min);

	console.log(trial_data["score"][trial_data["score"].length-1])


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
		            'intervention: ', int_state, 'score: ', score, '\n');
	}

	if ((timeout-count) % 5 === 0)
	{
		document.getElementById("countdown").innerHTML = (timeout-2*count)/10 + " seconds remaining";
	}

	//Stop at the end
	if ((2*count)>timeout)
	{
		console.log(phase);
		Stop();

		//Showing an overlay to start phase 2, or next device
		if (cur_phase<1) 
		{
			NextPhase();
		} else {
			phase = 0;
			score = 0;
			count = 0;

			$('#stage-start').prop('disabled', false);
			InitialiseBeta();
		}
		
	}
}

function OU(x0, cause, lambda, sigma) {
	//NOTE: the "cause" parameter is the value the process trends to. Can be a number 
	//if want to track to that specific number, doesn't have to be another series.
	return (x0 + lambda*(cause-x0) + sigma*myNorm())		
}

function Stop()
{
	//EnableContinue;
	
	console.log('stopping!', trial_data);

	clearInterval(the_process);
	clearInterval(countdown_timer);
	// SaveData(trial_data); //Now handled in task.js
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
// $(document).mouseup(function() {
// 	console.log('mouse up on body');

// 	if (intervention!='none')
// 	{
// 		stage_off = true;
// 	}
// });


//Helper function
function isNotZero(element, index, array) { 
	return element > 0; 
} 

function NextPhase() {
    // show the mask
    $("#mask").fadeTo(500, 0.25);
    // show the popup
    $("#popup").show();
}





function PhaseTwo()
{
  	phase++;

	rand_target = (rand_target+1) % 2; //If rand_target was 0, it becomes 1. if 1, becomes 0

	$(this).hide();
	$('#mask').hide();

    Run(betas, phase);

    // $('#stage-start').prop('disabled', true);			
}
