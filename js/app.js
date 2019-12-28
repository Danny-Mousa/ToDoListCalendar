

$( function (){

	const model = {

		days : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

		months : ["January","February","March","April","May","June","July",
		               "August","September","October","November","December"],

		addedEvents : []            

	};

	const octopus = {

		init : function() {
			view.init();
			this.todayEventsNotification();
		},

		setModelEventsArr : function () {

			let eventHolderStr = localStorage.getItem("eventsString");

			if( !eventHolderStr){ eventHolderStr = ''; } // initialize if null
			let eventsHolderArr = [];

			model.addedEvents = eventHolderStr.split(",");
		},

		getDays : function() {
			return model.days;
		},

		getMonths : function() {
			return model.months;
		},

		// BUILD THE WHOLE CALENDAR AND SHOW IT

		createCalender : function (year, monthIndex) {

			$("tbody").html("");
			octopus.CalenderBodyBuilder();
			octopus.showCalendar(year, monthIndex);
		},

		// BUILD THE HTML STRUCTURE FOR THE CALENDAR
		CalenderBodyBuilder : function() {

			let i, j,
			fragment = document.createDocumentFragment(),// TO REDUCE THE PAGE RENDERING TIMES TO ONLY ONE WITHOUT LEAVING ANY EXTRA ELEMENTS
			tRow = document.createElement("tr"),
			tData = document.createElement("td");



			for (i=0; i<6; i++){

				tRow = tRow.cloneNode();

				for(j=0; j<7; j++){

					tRow.appendChild( tData.cloneNode() );
				}

				fragment.append(tRow);
			}

			$("tbody").append(fragment);
		},

		// WILL RETURN THE NUMBER OF THE MONTH DAYS
		getMonthtDays : function(year, monthIndex) {
			return (32 - new Date(year, monthIndex, 32).getDate());
		},

		/* WILL RETURN A NUMBER WHICH REPRESENTS THE WEEKDAY NUMBER
		 (between 0 and 6, 0 for Sunday, 1 for Monday, 2 for Tuesday, and so on.)
		 FOR THE first DAY OF THE MONTH*/
		getFirstDay : function(year, monthIndex) {

			return new Date(year, monthIndex, 1).getDay();
		},

		showCalendar : function(year, monthIndex) {

			this.month = model.months[monthIndex];
			monthsDays = this.getMonthtDays(year, monthIndex);
			firstDay = this.getFirstDay(year, monthIndex);
			let i, j=1,
			tds= $("tbody").find("td");
			


			for(i=firstDay; i<monthsDays+firstDay; i++){
				
				tds.eq(i).text(j);
				j++;
			}

			//TO GET THE CIRCULAR BACKROUND FOR TODAY
			if( view.currentYear === year && view.currentMonthIndex === monthIndex) {

				let todayIndex = view.date.getDate();
				this.today = tds.eq(todayIndex-1+firstDay);
			    this.today.contents().wrap("<div class='today tableCell'></div>");
			}

			// PUTTING CURRENT MONTH IN THE APPROPRIATE PLACE
			$(".calender header").find("p").text( this.month +" "+ year);


			// EVENT LISTENER FOR HOVER OVER THE DAYS
			$("td").hover(function(){
				$(this).contents().wrap("<div class='daysHover tableCell'></div>"); //TO GET THE CIRCULAR BACKROUND FOR THE MATCHED ELEMENTS
			},
			function(){

				$(this).children(".daysHover").contents().unwrap();
			}
			);

			this.extractCurrentMonthEvents(year, monthIndex);
			
		},

		extractCurrentMonthEvents : function (year, monthIndex) {

			//SEARCHING FOR EVENTS INTO DISPLAYED MONTH
			this.viewedYeAndMo = `${year}-${monthIndex+1}-`;

			this.setModelEventsArr();

			this.currentMonthEvents = model.addedEvents.filter( function (element) {
					
				return element.startsWith(octopus.viewedYeAndMo);
			});

			this.thisMonthEvents ( this.currentMonthEvents );
		},

		thisMonthEvents : function ( monthEventsArr ) {

			this.toDoList = $(".offCanvas").find("ul");
			this.toDoListHeader = this.toDoList.prev();

			$("tbody").find("td").not(":has(div.eventBackground)").click( function(event){// {{{{{{{{{{ mix all td's listener on one function }}}}}}}}}}
				offcanvas.removeClass("close");
				offcanvas.addClass("open");
				offcanvas.children().show();// for nice style purpose
				overlay.addClass("open");// to prevent users form clicking any button outside the offcanvas

				octopus.toDoList.html(`<h4>You Have Nothing To Do On This Day</h4>`);

				let day = $(event.target).contents().text(),

				displyedDate = $(".calender header").find("p").text(),

				displyedDateArr = displyedDate.split(" "),

				monthName = displyedDateArr[0],
				yearName = displyedDateArr[1];

				newDate = new Date(`${yearName}-${monthName}-${day}`);

				dayName = model.days[newDate.getDay()];


				octopus.toDoListHeader.html(`<span>${dayName}.</span> ${monthName} ${day}, ${yearName}`) ;

			});

			let i;
			let arr = [];
			for(i=0; i<monthEventsArr.length; i++) { // {{{{{{{{{{ mix all td's listener on one function }}}}}}}}}}
				let fullInfo = monthEventsArr[i];
				let thisEvent = fullInfo.split(" "),
				fullDate = thisEvent[0];
			
				//to make sure that the target day get the click listener just once (for performance purpose)
				if ( arr.indexOf(fullDate) === -1){

					arr.push(fullDate);

					
					//getting the event day
					this.date = new Date(fullDate);

					let yearNum = this.date.getFullYear(),
					monthIndex = this.date.getMonth(),
					dayOrder = this.date.getDate(),
					firstDay = octopus.getFirstDay(yearNum, monthIndex);



					targetDay = $("tbody").find("td").eq(dayOrder-1+firstDay);

					

					//targetDay.contents().wrap("<div class='tableCell eventBackground'></div>");
					
					$("tbody").find("td").eq(dayOrder-1+firstDay).addClass("eventDot");

					targetDay.click( (function( monthEventsArr){

						return function (){
							offcanvas.removeClass("close");
							offcanvas.addClass("open");
							offcanvas.children().show();// for nice style purpose
							overlay.addClass("open");// to prevent users form clicking any button outside the offcanvas

							octopus.toDoList.html("");

							octopus.thisDayEvents = monthEventsArr.filter( function(ele){
								return ele.startsWith(fullDate);
							});
							

							octopus.thisDayEvents.sort( function(a,b){

								let date1 = a.split(" ");
								date1 = date1[1];

								let date2 = b.split(" ");
								date2 = date2[1];


								let compare = 0;

								if( date1 > date2) {
									return 1;
								}else if (date1 < date2){
									return -1;
								}

								return compare;
							});
							octopus.thisDayEvents.forEach( function( element){

								let thisEvent = element.split(" "),
								fullDate = thisEvent[0],
								pickDay = new Date(fullDate),
								day = pickDay.getDate(),
								dayName = model.days[pickDay.getDay()],
								monthName = model.months[pickDay.getMonth()],
								yearName = pickDay.getFullYear();
								// put the full date on the top of the openned canvas
								octopus.toDoListHeader.html(`<span>${dayName}.</span> ${monthName} ${day}, ${yearName}`);

								let imgUrl = thisEvent[thisEvent.length-1],
								titleArr = thisEvent.slice(2,thisEvent.length-1),
								title = titleArr.join(" "),

								theTime = thisEvent[1];
								timeArr = theTime.split(":");
								hours = timeArr[0];
								minutes = timeArr[1];
								// Check whether AM or PM 
								newformat = hours >= 12 ? "pm" : "am";
								//to use 12 hours format as well as to display "0" as "12"
								hour = hours > 12 ? hours -12: (hours > 0 ? hours : 12);
								
								octopus.toDoList.append(`
								<li>
									<img src=${imgUrl} alt='event icon image'>
									<div>
										<p> ${title}</p>
										<span>at ${hour}:${minutes} ${newformat}</span>
									</div>
								</li>
								`);
							});
						}
						
					})(monthEventsArr));

				}else {
					continue;
				}
			}
		},


		todayEventsNotification : function () {

			let totalDate = `${view.currentYear}-${view.currentMonthIndex+1}-${view.date.getDate()}`;

			let todayEventsArr = this.currentMonthEvents.filter( function(element){
				 return element.startsWith(totalDate);
			});

			$(".notification").text( todayEventsArr.length);
		}
	};

	const view = {

		init : function() {

			this.tableHeader = $("thead tr");
			tableHeader = this.tableHeader;
			this.days = octopus.getDays();
			days = this.days;
			this.months = octopus.getMonths();
			this.date = new Date();
			this.today = this.date.getDate();
			this.currentMonth = this.months[this.date.getMonth()];
			this.currentMonthIndex = this.date.getMonth();
			this.currentYear = this.date.getFullYear();
			this.menu = $(".seasonPic nav > span");
			this.offcanvas = $(".offCanvas");
			offcanvas = this.offcanvas;
			this.clear = $(".clear");
			this.add = $(".add");
			this.more = $("header div:last-child");
			this.main = $("main");
			let ulOptions = $("header ul");
			this.addDialog = $(".addDialog");
			addDialog =this.addDialog;
			this.exit = $(".exit");
			this.overlay = $(".overlay");
			overlay = this.overlay;
			this.title = $("dialog.addDialog input[type='text']");
			this.anotherDate = $("dialog.addDialog input[type='date']");
			this.time = $("dialog.addDialog input[type='time']");
			this.imageSelector = $("dialog.addDialog select");
			this.submit = $("dialog.addDialog input[type='submit']");
			this.form = this.addDialog.find("form");
			form = this.form;
			this.goToDialog = $(".goToDialog");
			goToDialog = this.goToDialog;
			this.goToForm = this.goToDialog.find("form");
			goToForm = this.goToForm;
			goToDate = $(".goToDialog input");
			
			// **************** SHOWING EVERY THING RELATED TO THE ACTUAL CALENDAR *************//

			// SHOWING WEEK DAYS
			let i;
			for(i=0; i<7; i++){

				tableHeader.append($(`<th>${days[i]}</th>`));
			}

			// RENDERING THE CALENDER

			octopus.CalenderBodyBuilder();
			octopus.showCalendar(this.currentYear, this.currentMonthIndex);


			// **************** SETTING UP THE OFFCANVAS FEATURE *************//
			

			this.menu.click(function(){
				octopus.today.trigger("click");
			});

			this.clear.click(function(){

				octopus.toDoList.html("");
				offcanvas.removeClass("open");
				offcanvas.addClass("close");
				offcanvas.children().hide();// for nice style purpose
				overlay.removeClass("open");
			});

			// **************** SETTING UP (MORE) BUTTON *************//

			this.more.click( function(event) {

				event.stopPropagation();
				ulOptions.toggleClass("open");
			});
			
			// TO CLOSE THE (MORE) BUTTON MENU WHEN CLICK ANYWHERE INSIDE THE MIAN ELEMENT
			this.main.click( function() {

				ulOptions.removeClass("open");
			});


			// **************** SETTING UP THE ADD EVENTS FEATURE *************//



			this.add.click(function(){
				addDialog.attr("open", true);
				overlay.addClass("open");// to prevent users form clicking any button outside the add event modal
				form.trigger("reset");

				//make the current date is the default date for input[type=date] element
				view.anotherDate.val(view.currentYear+"-"+(view.currentMonthIndex+1)+"-"+view.today);

				//make the current time is the default time for input[type=time] element
				let currentTime = new Date();
				let h = currentTime.getHours();
				let m = currentTime.getMinutes();

				if(h < 10) h = '0' + h; 
                if(m < 10) m = '0' + m; 

				view.time.val(h+":"+m);

			});


			this.exit.click(function(){
				addDialog.removeAttr("open");
				goToDialog.removeAttr("open");
				overlay.removeClass("open");
			});

			// SETTING UP THE DELETE ALL EVENTS FEATURE

			this.add.siblings("li:contains(Delete All Events)").click(function() {
				localStorage.clear();
				octopus.createCalender(view.currentYear, view.currentMonthIndex);
				octopus.todayEventsNotification();
			});

			// **************** SETTING UP THE GO TO FEATURE *************//

			this.add.siblings("li:contains(Go To)").click(function(){
				goToDialog.attr("open", true);
				overlay.addClass("open");// to prevent users form clicking any button outside the add event modal
				goToForm.trigger("reset");
				//make the current date is the default date for input[type=date] element
				goToDate.val(view.currentYear+"-"+(view.currentMonthIndex+1)+"-"+view.today);
			});

			goToForm.submit( function() {

				goToDialog.removeAttr("open");
				overlay.removeClass("open");

				goToDialogStr = goToDate.val();

				let goToArr = goToDialogStr.split("-");

				let yearStr = goToArr[0];
				let monthStr = goToArr[1];

				let yearNum = Number(yearStr);

				let monthIndex = Number(monthStr) -1;

				// show the requested month inside appropriate year
				octopus.createCalender(yearNum, monthIndex);

				// make a circular background to the requested day
				let date = new Date(goToDate.val());
				let dayOrder = date.getDate();

				let firstDay = octopus.getFirstDay(yearNum, monthIndex);
				$("tbody").find("td").eq(dayOrder-1+firstDay).contents().wrap("<div class='today tableCell'></div>");
			});


			

			this.render();

		},

		render : function () {
			
			title = this.title;
			anotherDate = this.anotherDate;
			time = this.time;
			imageSelector = this.imageSelector;
			submit = this.submit;
			
			currentYear = this.currentYear;
			currentMonthIndex = this.currentMonthIndex;
			this.leftArrow = $(".left");
			this.rightArrow = $(".right");
			this.arrowContainer = $(".calender header");
			
			let i;

			// EVENT LISTENER WHEN SUBMIT A FORM
			form.submit( function() {

				addDialog.removeAttr("open");
				overlay.removeClass("open");


				
				dateS = anotherDate.val();
				timeS = time.val();
				console.log(timeS);
				titleS = title.val();
				imageSelectorS = imageSelector.val();

				var allDetails = dateS+" "+timeS+" "+titleS+" "+imageSelectorS;

				// save entered details on local storage
				let eventHolderStr = localStorage.getItem("eventsString");

				if( !eventHolderStr){ eventHolderStr = ''; } // initialize if null


				let eventsHolderArr = [];

				eventsHolderArr = eventHolderStr.split(",");
				eventsHolderArr.push(allDetails);

				// TO NOT SHOWING THE DOT NOTIFICATION ON CURRENT MONTH IF WE INSERTED AN EVENT
				//  WHICH IS RELATED TO ANOTHER MONTH WHILE THE CURRENT MONTH IS DISPLAYED ON THE SCREEN

				let displyedDate = $(".calender header").find("p").text();

				let allDate = displyedDate.split(" ");

				let monthStr = allDate[0];
				let yearStr = allDate[1];

				let monthIndex = model.months.indexOf(monthStr);
				let year = Number(yearStr);

				eventHolderStr = eventsHolderArr.join(",");

				localStorage.setItem("eventsString", eventHolderStr);


				// KEEP THE model.addedEvents SYNCHRONIZED WITH ANY ENTRY
				octopus.setModelEventsArr();
				// SHOW ANY ENTRY INSTANTLY ON THE DISPLAYED CALENDAR
				octopus.extractCurrentMonthEvents(year, monthIndex);

				octopus.todayEventsNotification();
			});
				
			   // ****** SETTING UP THE RENDERING FUNCTIONALITY TO USE IT WHEN NAVIGATE THE DATES *******//
			//***************** SETTING UP AN EVENT LISTENERS ON THE LEFT AND RIGHT ARROW BUTTTONS *********//

			this.arrowContainer.on("click", "span", function(event){

				event.stopPropagation();

				if ( $(event.target).is( $(".left") ) ){
					i = -1;
				}else if( $(event.target).is( $(".right") )){
					i = +1;
				}

				/*picking up the date which is shown on the calendar and then convert it
				 to the Number type in order to be able passing them to a new Date() Method
				*/ 
				let str = $(".calender header").find("p").text();
				let allDate = str.split(" ");

				let monthStr = allDate[0];
				let yearStr = allDate[1];

				let monthIndex = model.months.indexOf(monthStr);
				let year = Number(yearStr);

			
				newDate = new Date(year, monthIndex +i );

				octopus.createCalender( newDate.getFullYear() , newDate.getMonth() );

			});
		}

	};

	octopus.init();
});