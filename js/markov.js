var human_phrase_dataset = ["meet me at market square", "let me know if that will work for you", "we don't want the game to last too long", "we'll have some drinks", "I'm back in Durham tomorrow", "I will come up and visit", "I have a sick blow up bed", "we can sit together", "no girls around", "it will start slowly", "no girls allowed", "I hope people remember this", "this has nothing to do with politics", "It's pretty fantastic", "It does give you powerful tools", "the tutorial doesn't seem that bad", "explain why all of these things are on the screen", "visit when it is time to visit", "this phrase was made by a human", "this phrase was not made by a human", "hopefully people will read this", "please help I'm trapped in the computer", "this one was written by the algorithm", "I am staying at Subodha's tonight", "it is dangerous to wear blue", "it can be scary outside at night", "it is starting to get a bit dark", "the walls around me are white", "I have a chicago bears hat to my right", "hopefully this will be enough", "I am not sure how many phrases will be needed", "We can try using thirty five", "Although I am not sure how much these will line up", "I need an algorithm for rendering the chain visually", "I'm so pumped right now", "Why would you let your dog watch that", "you get called Joe sometimes", "this sentence is a lie", "there are fifty five snails on the wall", "not to be sold separately", "that shirt looks great on you", "give me the laptop", "would you like any chocolate", "what are you gonna do", "that was probably the right choice", "How's it going?", "I tried to think of something clever, I failed.", "I'm just going to the library.", "Hey! How's it going?", "Your hair looks nice.", "Russia will not stand for this", "How do you do?", "Will do.", "How is it going?", "What have you been up to?", "Sounds great.", "What are you doing tomorrow? ", "Did you watch the game? ", "How's it going?", "How about those Chicago Bears?", "Right, see you later.", "What's good?", "You wanna go?", "What's up dog?", "What, seriously?", "How's it going?", "Cold day, isn't it?", "Do you know what time it is?", "It's so great to see you!", "How are you feeling?", "Where should we meet?", "Hey man, how was the show last night?", "I'm so hungry!  Are you?", "What are you up to today?", "How's your mom doing?", "Where do you work?", "How's it going? ", "I'm happy to help. ", "How you doin'?", "You lookin' fine, homeboy!", "Hold your horses!", "Gorillas like bananas", "Hey, what's up?", "Do you need help?", "Good luck!", "how was your day", "Good day, sir.", "Hey how are you?", "Let's go to the Thai supermarket to eat lunch"];
//var human_phrase_dataset = ["I am hungry", "I am full", "I am David"];
/* VIEW CONTROLLER */

var static_markov_chain = getMarkovChainFromHumanPhrases();
//var static_markov_chain = new Object();

//SETTINGS//
var AI_SHOULD_LEARN = true;

function initPage()
{
	setupNewRound();
}

function setupNewRound()
{
	var human_phrase = getSinglePhrase();
	var algorithm_phrase = getAlgorithmPhrase(3, static_markov_chain);

	if(Math.random() > 0.5)
	{
		$("#phrase1").text(human_phrase);
		$("#btn1").attr("human", "true");

		$("#phrase2").text(algorithm_phrase);
		$("#btn2").attr("human", "false");
	}
	else
	{
		$("#phrase1").text(algorithm_phrase);
		$("#btn1").attr("human", "false");

		$("#phrase2").text(human_phrase);
		$("#btn2").attr("human", "true");
	}
}

function evalButtonPress(num)
{
	if($("#btn"+num).attr("human") == "true")
	{
		var score_count = parseInt($("#score").attr("count")) + 1;

		$("#score").attr("count", score_count);
		$("#score").text("Score: " + score_count);
		$("#previousguess").text("Correct!");
	}
	else
	{
		$("#previousguess").text("Wrong!");
		
		if(AI_SHOULD_LEARN) addPhraseToMarkovChain($("#phrase"+num).text(), static_markov_chain);
	}

	var guess_count = parseInt($("#guesscounter").attr("count")) + 1;

	$("#guesscounter").attr("count", guess_count);
	$("#guesscounter").text("Guesses: " + guess_count);

	setupNewRound();
}

function evalTie()
{
	var ai_phrase = "";

	if($("#btn1").attr("human") == "true")
	{
		ai_phrase = $("#phrase1").text();
	}
	else
	{
		ai_phrase = $("#phrase2").text();
	}

	if(AI_SHOULD_LEARN) addPhraseToMarkovChain(ai_phrase, static_markov_chain);

	var tie_count = parseInt($("#tiecounter").attr("count")) + 1;

	$("#tiecounter").attr("count", tie_count);
	$("#tiecounter").text("Ties: "+ tie_count);

	$("#previousguess").text("Tie!");

	setupNewRound();
}

function importChain()
{
	static_markov_chain = JSON.parse($("#chaintext").val());
}

function exportChain()
{
	console.log(JSON.stringify(static_markov_chain));
}

/* HUMAN PHRASE DATASET LIASON */

function getSinglePhrase()
{
	var index = Math.floor(Math.random() * human_phrase_dataset.length);

	return getSinglePhraseByIndex(index);
}

function getSinglePhraseByIndex(index)
{
	return human_phrase_dataset[index];
}

function getManyPhrases(num_to_get)
{
	var selected_phrases_reference = [];
	var phrases_to_be_returned = [];

	while(phrases_to_be_returned.length < num_to_get)
	{
		var index = Math.floor(Math.random() * human_phrase_dataset.length);
		var valid_phrase = false;

		while(!valid_phrase)
		{
			if(typeof selected_phrases_reference[index] == "undefined") //If this phrase hasn't been added yet
			{
				phrases_to_be_returned.push(getSinglePhraseByIndex(index));
				selected_phrases_reference[index] = true;
				valid_phrase = true;
			}

			else
			{
				index = index + 1 % (human_phrase_dataset.length-1);
			}
		}
	}

	return phrases_to_be_returned;
}

function getAllPhrasesFromDataset()
{
	return human_phrase_dataset;
}

/* MARKOV CHAIN GENERATOR */

function getMarkovChainFromHumanPhrases()
{
	var phrases = getAllPhrasesFromDataset();

	var markovChain = new Object();

	markovChain.startwords = [];
	markovChain.corewords = new Object();

	for(var c = 0; c < phrases.length; c++)
	{
		addPhraseToMarkovChain(phrases[c], markovChain);
	}

	return markovChain;
}

function addPhraseToMarkovChain(phrase, chain)
{
	var words_from_phrase = phrase.split(' ');

	if(chainIsNotValid(chain))
	{
		chain.startwords = new Object();
		chain.corewords = new Object();
	}

	var final_word = words_from_phrase[words_from_phrase.length-1];

	if(typeof chain.corewords[final_word] == "undefined")
	{
		chain.corewords[final_word] = new Object();
		chain.corewords[final_word].word = final_word;
		chain.corewords[final_word].next_words = [];
	}
	chain.corewords[final_word].terminal = true;

	chain.startwords = addWordToWeightArray(words_from_phrase[0], chain.startwords);

	for(var i = 0; i < words_from_phrase.length; i++)
	{
		var working_word = words_from_phrase[i];
		var next_word = words_from_phrase[i+1];

		if(chain.corewords.hasOwnProperty(working_word))
		{
			chain.corewords[working_word].next_words = addWordToWeightArray(next_word, chain.corewords[working_word].next_words);
		}
		else
		{
			var temp_word_obj = new Object();

			temp_word_obj.word = working_word;
			temp_word_obj.terminal = false;
			temp_word_obj.next_words = [];
			temp_word_obj.next_words = addWordToWeightArray(next_word, temp_word_obj.next_words);

			chain.corewords[working_word] = temp_word_obj;
		}
	}

	return chain;
}

function addWordToWeightArray(word, weight_array)
{
	if(typeof word == "undefined") return weight_array;

	for(var i = 0; i < weight_array.length; i++)
	{
		var working_weight = weight_array[i];

		if(working_weight.word == word)
		{
			working_weight.weight += 1;
			return weight_array;
		}
	}

	weight_array.push({"word": word, "weight": 1});
	return weight_array;
}

function chainIsNotValid(chain)
{
	return (typeof chain.corewords == "undefined" || typeof chain.startwords == "undefined");
}

/* PHRASE GENERATOR */

var weightedChoice = function(array) 
{
	var weight_sum = 0;

	for(var i = 0; i < array.length; i++)
	{
		weight_sum += array[i].weight;
	}

	var weighted_index = Math.floor(Math.random()*weight_sum);

	for(var i = 0; i < array.length; i++)
	{
		weighted_index -= array[i].weight;

		if(weighted_index <= 0) return array[i];
	}

	return array[array.length-1];
};

var getAlgorithmPhrase = function(min_length, working_chain)
{
	var word = weightedChoice(working_chain.startwords).word;
	var phrase = [word];

	while(typeof working_chain.corewords[word] != "undefined")
	{
		var next_words = working_chain.corewords[word].next_words;

		var next_word_object = weightedChoice(next_words);
		if(typeof next_word_object == "undefined") break;

		word = next_word_object.word;
		phrase.push(word);

		if(phrase.length > min_length && working_chain.corewords[word].terminal) break;
	}

	if(phrase.length < min_length)
	{
		return getAlgorithmPhrase(min_length, working_chain);
	}

	return phrase.join(' ');
}


//GET THINGS STARTED

initPage();