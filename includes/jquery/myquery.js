// My Custom JQuery

$(function (){

	var pageNo;
	var studUrl, updUrl, delUrl, addUrl;
	var startRecord = 0;
	var dataToSearch;
	var dataLength;
	var recLimit;
	var srchType;
	var curLength;

	var fullDetails = true;
	var searchDetails = false;
	var isEnd = false;

	// Starting and Ending records
	var startEndDetails = {};

	// Nodes
	var $buttonSearchName = $('#searchbuttonname');
	var $resultHead = $('#result-head');
	var $resultBody = $('#result-body');
	var $resultFoot = $('#result-foot');
	var $submitAddStudent = $('#add-stud-button');
	var $formAddStudent = $('.add-form');
	
	// Templates
	var showCountTemp = $('#show-count-template').html();
	var studDetailTemp = $('#show-student-details-template').html();
	var prevTemp = $('#show-prev-template').html();
	var nextTemp = $('#show-next-template').html();
	var endTemp = $('#show-end-template').html();

	// ---(Initial)-----> To load all student list
	recLimit = 11;
	$('input#searchRadio1').prop('checked',true);
	loadStudentDetails();	


	//---(Function)-----> Load all Student Details
	function loadStudentDetails()
	{		
		fullDetails = true;
		searchDetails = false;		
		studUrl = '/student?_start=0&_limit=' + recLimit;
		startRecord = 0;	
		pageNo = 1;
		getStudentDetails();	
	}

	//---(Function)-----> Append Templates
	function addTemplate ($parentNod, templateName, rec)
	{
		$parentNod.append(Mustache.render(templateName, rec));
	}

	//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	//---(Function)-----> GET AJAX
	function getStudentDetails()
	{
		$('#result-head div').remove();
		$('#result-body tr').remove();
		$('#result-foot div').remove();
		$.ajax(
		{
			type: 'GET',
			url: studUrl,
			success : function (data)
			{
				curLength = data.length;
				if (curLength == 0)
				{
					loadStudentDetails();
					alert("No result found! Loading all records...");
				}
				else
				{
					if(curLength == recLimit)
						curLength--;
					console.log("Count = " + curLength);
					startEndDetails = { start: startRecord + 1, end: startRecord + curLength};
					addTemplate( $resultHead, showCountTemp, startEndDetails);
					$.each(data, function(i, student)
					{
						addTemplate($resultBody, studDetailTemp, student);
						$('.more-detail-row').fadeOut(0);
						if(i==recLimit-2)
							return false;

					});
					if(data.length != recLimit)
					{
						addTemplate($resultBody, endTemp);
						isEnd = true;
					}
					else
					{
						addTemplate($resultFoot, nextTemp);
						isEnd = false;
					}
					if(startRecord > 0)
					{
						addTemplate($resultFoot, prevTemp);	
					}
				}				
			}
		});
	}

	//---(Function)-----> POST AJAX - Add Student
	function addStudentDetails(studDetails)
	{
		addUrl = '/student';
		$.ajax(
		{
			type: 'POST',
			url: addUrl,
			data: studDetails,
			success : function (data)
			{
				console.log("Successfully Added New Student")
				$('#my-modal-1').modal('hide');
				$('#my-modal-1').find('input[type="text"],input[type="email"],input[type="date"],input[type="number"],textarea,select').val('');
				$('input[name=inlineRadioOptions]').attr('checked',false);
				alert("Student Added Successfully - New ID : " + data.id);
				getStudentDetails();
			},
			error : function (data)
			{
				console.log("Error in Adding new Student");
			}
		});
	}

	//---(Function)-----> PUT AJAX
	function updateStudentDetails(idToUpdate, studDetails, mainDiv, topTr)
	{
		updUrl = '/student/' + idToUpdate;
		$.ajax(
		{
			type: 'PUT',
			url: updUrl,
			data: studDetails,
			success : function (data)
			{
				console.log("Successfully updated Student Details")
				
				// Updating the Table Columns and more details Tab
				$(topTr).find('td#main-clas-div').html(studDetails.clas + " " + studDetails.div);
				$(topTr).find('td#main-name').html(studDetails.name);

				$(mainDiv).find('span.sName').html(studDetails.name);
				$(mainDiv).find('span.sClass').html(studDetails.clas);
				$(mainDiv).find('span.sDiv').html(studDetails.div);
				$(mainDiv).find('span.sGendr').html(studDetails.gender);
				$(mainDiv).find('span.sDob').html(studDetails.dob);
				$(mainDiv).find('span.sFName').html(studDetails.fatherName);
				$(mainDiv).find('span.sYJoin').html(studDetails.yearOfJoin);
				$(mainDiv).find('span.sAddr').html(studDetails.address);
				$(mainDiv).find('span.sComm').html(studDetails.comments);

				$(mainDiv).find('.show-class').addClass('hide-class').removeClass('show-class');
				$(mainDiv).find('.strt-class').addClass('show-class').removeClass('hide-class');			

				alert("Successfully updated Student Details");	
			}
		});
	}

	//---(Function)-----> DELETE AJAX
	function deleteStudentDetails(idToDelete, $thisStudent)
	{
		delUrl = '/student/' + idToDelete;
		$.ajax(
		{
			type: 'DELETE',
			url: delUrl,
			success : function (data)
			{
				$thisStudent.prev().remove();
				$thisStudent.remove();
				
				newEndCount = $('span.end-count').html() - 1;
				if(newEndCount == 0)
				{
					loadStudentDetails();
				}
				else
				{
					getStudentDetails();
				}
			
				alert("Student Deleted Successfully");
			},
			error : function (data)
			{
				alert("Connection lost..Delete unsuccessful! Try Again")
			}
		});
	}
	//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


	//*******************************************************************************************************
	//---(Event)-----> More-Details Button Event
	$resultBody.delegate('.more-details','click', function(event)
	{
		$(this).closest('.tr').next().fadeToggle(100);
		if ( $(this).attr('data-id') == 'close' )
		{
			$(this).html('<span class="glyphicon glyphicon-chevron-up"/>')
			$(this).attr('data-id','open');
		}
		else
		{
			$(this).html('<span class="glyphicon glyphicon-chevron-down"/>')
			$(this).attr('data-id','close');
			
			// Cancel Editing if editing is enabled
			var mainDivision = $(this).closest('.tr').next().find('.full-details');
			
			$(mainDivision).find('.show-class').addClass('hide-class').removeClass('show-class');
			$(mainDivision).find('.strt-class').addClass('show-class').removeClass('hide-class');
		}
	});

	//---(Event)-----> Refresh (Load) Button Event
	$resultHead.delegate('.refresh','click', function(event)
	{
		console.log("refreshing...");
		$('#textbox-data').val('');
		fullDetails = true;
		searchDetails = false;
		loadStudentDetails();
	});	

	//---(Event)-----> Search Button Event
	$buttonSearchName.on('click', function()
	{		
		dataToSearch = $('#textbox-data').val();
		dataToSearch = dataToSearch.trim();
		if(dataToSearch.length > 0)
		{
			srchType = $("input[name='searchType']:checked").val();
			if(srchType == 'clas')
			{
				if(dataToSearch.length == 1)
				{
					if(isLetter(dataToSearch))
					{
						dataToSearch=dataToSearch.toUpperCase();
						srchType = 'div';
					}
				}
				if(dataToSearch.length <= 4)
				{
					var fSpceindx = dataToSearch.indexOf(' ');
					var lSpceindx = dataToSearch.lastIndexOf(' ');
					console.log("Index : " + fSpceindx + " " + lSpceindx)
					if(fSpceindx <= lSpceindx && fSpceindx != -1)
					{
						var cls = dataToSearch.substring(0, fSpceindx);
						var divi = dataToSearch.substring(lSpceindx + 1, dataToSearch.length);
						console.log("'"+cls + "' and '" + divi+"'");
						divi=divi.toUpperCase();
						dataToSearch = "" + cls + "&div=" + divi;
					}
				}
			}
			fullDetails = false;
			searchDetails = true;
			studUrl = '/student?' + srchType + '=' + dataToSearch + '&_start=0&_limit='+ recLimit;
			startRecord = 0;
			pageNo = 1;
			getStudentDetails();
		}
	});

	//---(Event)-----> Add Student Submit Button Event
	$formAddStudent.on('submit', function (e)
	{
		e.preventDefault();
		var studGend = $("input[name='inlineRadioOptions']:checked").val();
		var	studName = $('.stud-name').val();
		var	studClass = $('.stud-class').val();
		var	studDiv = $('.stud-div').val();
		var	studFName = $('.stud-fname').val();
		var	studJDate = $('.stud-join').val();
		var	studDOB = $('.stud-dob').val();
		var	studAddr = $('.stud-address').val();
		var	studComment = $('.stud-comments').val();

		if (studComment.length == 0)
			studComment = 'No Comments';

		// Backend Validation for Add Student Starts Here
		var isValid = true;
		var msg;

		for(var i=0;i<studFName.length;i++)
		{
			if (!isLetter(studFName[i]) && studFName[i] != " ")
			{
				isValid = false;
				msg = "Father's Name should contain only Alphabets!";
				break;
			}
		}

		if (isLetter(studDiv))
		{
			studDiv = studDiv.toUpperCase();
		}
		else
		{
			isValid = false;
			msg = "Division should be an Alphabet!";
		}		

		if( studClass < 1 || studClass > 12)
		{
			isValid = false;
			msg = "Class should be between 1 and 12!"
		}
		
		for(var i=0;i<studName.length;i++)
		{
			if (!isLetter(studName[i]) && studName[i] != " ")
			{
				isValid = false;
				msg = "Student Name should contain only Alphabets!";
				break;
			}
		}
		// Backend Validation for Add Student Ends Here
		
		if(isValid)
		{
			var studDetails = {
				name : studName,
				clas : studClass,
				div : studDiv,
				address : studAddr,
				yearOfJoin : studJDate,
				dob : studDOB,
				gender : studGend,
				fatherName : studFName,
				comments : studComment
			};
			
			addStudentDetails(studDetails);	
		}
		else
		{
			alert(msg);
		}
	});

	//---(Event)-----> Delete Student Button Event
	$resultBody.delegate('.delete-details','click', function(event)
	{
		var $thisStudent = $(this).closest('.tr');
		var idToDelete = $(this).attr('data-id');
		var resp = confirm("All the details related to this Student will be deleted!");
		if(resp)
		{
			deleteStudentDetails(idToDelete, $thisStudent);
		}		
	});

	//---(Event)-----> Edit Button Event
	$resultBody.delegate('.edit-details','click', function(event)
	{		
		var mainDiv = $(this).closest('.full-details');

		var getName = $(mainDiv).find('span.sName').html();
		var getClass = $(mainDiv).find('span.sClass').html();
		var getDiv = $(mainDiv).find('span.sDiv').html();
		var getGen = $(mainDiv).find('span.sGendr').html();
		var getDob = $(mainDiv).find('span.sDob').html();
		var getFName = $(mainDiv).find('span.sFName').html();
		var getYJoin = $(mainDiv).find('span.sYJoin').html();
		var getAddr = $(mainDiv).find('span.sAddr').html();
		var getComm = $(mainDiv).find('span.sComm').html();

		$(mainDiv).find('input#updatename').val(getName);
		$(mainDiv).find('input#updateclass').val(getClass);
		$(mainDiv).find('input#updatediv').val(getDiv);
		$(mainDiv).find('input#updatedob').val(getDob);
		$(mainDiv).find('input#updatefname').val(getFName);
		$(mainDiv).find('input#updatejdate').val(getYJoin);
		$(mainDiv).find('textarea#updateaddr').val(getAddr);
		$(mainDiv).find('textarea#updatecomm').val(getComm);
		$(mainDiv).find('input.' + getGen + '-radio').prop('checked',true);
		
		$(mainDiv).find('.hide-class').addClass('show-class').removeClass('hide-class');
		$(mainDiv).find('.strt-class').addClass('hide-class').removeClass('show-class');
	});

	//---(Event)-----> Edit Cancel Button Event
	$resultBody.delegate('.noedit-details','click', function(event)
	{
		event.preventDefault();
		console.log("Cancel Button");
		var mainDiv = $(this).closest('.full-details');
		$(mainDiv).find('.show-class').addClass('hide-class').removeClass('show-class');
		$(mainDiv).find('.strt-class').addClass('show-class').removeClass('hide-class');
	});

	//---(Event)-----> Edit Save Button Event
	$resultBody.delegate('.save-details','click', function(event)
	{
		event.preventDefault();
		console.log("Save Button");

		var mainDiv = $(this).closest('.full-details'); // Pointing to more details tab (well)

		var topTr = $(this).closest('.tr').prev(); // Pointing to main Table Row of the record

		var idToUpdate = $(this).attr('data-id');

		var uGend = $(mainDiv).find("input[name='updateRadioOptions']:checked").val();
		var	uName = $(mainDiv).find('#updatename').val();
		var	uClass = $(mainDiv).find('#updateclass').val();
		var	uDiv = $(mainDiv).find('#updatediv').val();
		var	uFName = $(mainDiv).find('#updatefname').val();
		var	uJDate = $(mainDiv).find('#updatejdate').val();
		var	uDOB = $(mainDiv).find('#updatedob').val();
		var	uAddr = $(mainDiv).find('#updateaddr').val();
		var	uComment = $(mainDiv).find('#updatecomm').val();

		if (uComment.length == 0)
			uComment = 'No Comments';
		
		// Backend Validation for Update Student Starts Here
		var isValid = true;
		var msg;

		for(var i=0;i<uFName.length;i++)
		{
			if (!isLetter(uFName[i]) && uFName[i] != " ")
			{
				isValid = false;
				msg = "Father's Name should contain only Alphabets!";
				break;
			}
		}

		if (isLetter(uDiv))
		{
			uDiv = uDiv.toUpperCase();
		}
		else
		{
			isValid = false;
			msg = "Division should be an Alphabet!";
		}		

		if( uClass < 1 || uClass > 12)
		{
			isValid = false;
			msg = "Class should be between 1 and 12!"
		}
		
		for(var i=0;i<uName.length;i++)
		{
			if (!isLetter(uName[i]) && uName[i] != " ")
			{
				isValid = false;
				msg = "Student Name should contain only Alphabets!";
				break;
			}
		}
		// Backend Validation for Update Student Ends Here

		if(isValid)
		{
			var studDetails = {
				name : uName,
				clas : uClass,
				div : uDiv,
				address : uAddr,
				yearOfJoin : uJDate,
				dob : uDOB,
				gender : uGend,
				fatherName : uFName,
				comments : uComment
			};
			
			updateStudentDetails(idToUpdate, studDetails,mainDiv, topTr);
		}
		else
		{
			alert(msg);
		}

	});


	//---(Event)-----> Next Button Event
	$resultFoot.delegate('#next-button','click', function(event)
	{
		console.log('Clicked Next');
		pageNo++;
		startRecord = startRecord + curLength;
		if(fullDetails)
			studUrl = '/student?_start=' + startRecord + '&_limit=' + recLimit;
		else
			studUrl = '/student?' + srchType + '=' + dataToSearch + '&_start=' + startRecord + '&_limit='+ recLimit +'&_sort=id&_order=ASC';
		getStudentDetails();
	});

	//---(Event)-----> Prev Button Event
	$resultFoot.delegate('#prev-button','click', function(event)
	{
		console.log('Clicked Prev');
		pageNo--;
		startRecord = startRecord - recLimit;
		if(fullDetails)
			studUrl = '/student?_start=' + startRecord + '&_limit=' + recLimit;
		else
			studUrl = '/student?' + srchType + '=' + dataToSearch + '&_start=' + startRecord + '&_limit='+ recLimit +'&_sort=id&_order=ASC';
		getStudentDetails();
	});
	//*******************************************************************************************************

	//-------------------------------------------------------------------------------------------------------
	// Modal-Height-Setting
	function setModalMaxHeight(element)
	{
		this.$element     = $(element);
		this.$content     = this.$element.find('.modal-content');
		var borderWidth   = this.$content.outerHeight() - this.$content.innerHeight();
		var dialogMargin  = $(window).width() > 767 ? 60 : 20;
		var contentHeight = $(window).height() - (dialogMargin + borderWidth);
		var headerHeight  = this.$element.find('.modal-header').outerHeight() || 0;
		var footerHeight  = this.$element.find('.modal-footer').outerHeight() || 0;
		var maxHeight     = contentHeight - (headerHeight + footerHeight);

		this.$content.css({
	    	'overflow': 'hidden'
	  	});

	  	this.$element
	    	.find('.modal-body').css({
	      		'max-height': maxHeight,
	      		'overflow-y': 'auto'
	  		});
	}

	$('.modal').on('show.bs.modal', function()
	{
	  	$(this).show();
	  	setModalMaxHeight(this);
	});

	$(window).resize(function() {
		if ($('.modal.in').length != 0)
		{
	    	setModalMaxHeight($('.modal.in'));
	  	}
	});
	// End-of-Modal-Height-Setting
	//-------------------------------------------------------------------------------------------------------
	// Check whether Alphabet or not
	function isLetter(c)
	{
  		return c.toLowerCase() != c.toUpperCase();
	}

	//-------------------------------------------------------------------------------------------------------
	
	
});

// End
