// Google Analytics tracking
 var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-9487590-12']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();


function doConvert() {



	function writeFile(){
		$.ajax({
	      url: '/write/',
	      data: {'tableHTML': $("#htmlText").val()},
	      method: 'POST',
	      success: function(data) {
	        $("#embed-code").text("<div data-pym-src='"+ data +"'>&nbsp;</div>")
			$("#embed-code").css("display", "block")
	      }
	    });

	    

	}


	var input = $('#csvText').val();
	var hasRowHeaders = $('#optFirstRowHeaders').prop('checked');
	var hasColHeaders = $('#optFirstColHeaders').prop('checked');
	var hasFooter = $('#optLastRowFooter').prop('checked');
	var hasCaption = $('#optCaption').prop('checked');
	var captionText = $('#textCaption').val();
	var tablePreview = $("#table-preview");

	// trim some of that whitespace!!
	// borrowed from http://stackoverflow.com/questions/3721999/trim-leading-trailing-whitespace-from-textarea-using-jquery
	input = $.trim(input).replace(/\s*[\r\n]+\s*/g, '\n')
                               .replace(/(<[^\/][^>]*>)\s*/g, '$1')
                               .replace(/\s*(<\/[^>]+>)/g, '$1');


	// use the jquery-csv plugin to turn the csv into an array
	var csvArray = $.csv.toArrays(input);

	
	// start creating the table
	var output = "<link rel='stylesheet' href='../static/tablesort.css'>\
    <table id='preview-table' class='pure-table pure-table-striped table-responsive'>\n";
	
	// if the user wants a caption, add that!
	if (hasCaption) {
		output += "<caption>" + captionText + "</caption>\n";
	}

	// let's get the header if needed.
	if (hasRowHeaders) {
		var head = "";
		var firstRow = csvArray[0];

		head += "  <thead>\n    <tr>\n";

			$.each(firstRow,function(i,val){
				head += "      <th scope=\"col\">"+val+"</th>\n";
			});

		head += "    </tr>\n  </thead>\n";

		output += head;

		// remove the first row from the array
		csvArray.splice(0,1);
	}

	// let's get the footer if needed.
	// since the tfooter is placed before the body, we'll do the parsing acoordingly,
	// then remove the last row from the array so that it doesn't end up in the body again.
	if (hasFooter) {
		var footer = "";
		
		var lastElement = csvArray.length-1;
		var lastRow = csvArray[lastElement];
		
		footer += "  <tfoot>\n    <tr>\n";

			$.each(lastRow,function(i,val){
				footer += "      <th>"+val+"</th>\n";
			});

		footer += "    </tr>\n  </tfoot>\n";

		output += footer;

		// remove the last row from the array
		csvArray.splice(lastElement,1);
	}

	// now let's get to the body!
	var body = "  <tbody>\n";
	$.each(csvArray, function(i, val){
		
		// initialize the row output
		var row = "    <tr>\n";
		
		$.each(val,function(i,val){
			if (i===0 && hasColHeaders) {
				row += "      <th scope=\"row\">"+val+"</th>\n";
			}
			else {
				row += "      <td data-label='"+ firstRow[i] +"'>"+val+"</td>\n";
			}
		});
		row += "    </tr>\n";

		
		body+=row;
	});

	body += "  </tbody>\n";

	output += body;
	
	output += "</table>";

	output += "<script src='../static/tablesort.min.js'></script>\
    <script src='../static/sorts/tablesort.number.min.js'></script>\
    <script src='../static/sorts/tablesort.date.min.js'></script>\
    <script>\
    new Tablesort(document.getElementById('preview-table'));\
    </script>";

	// output!
	$('#htmlText').val(output); // throw the html into a textarea

	// make preview code that has indent options
	// var outputPreview = output.toString().split("<tr>").join("<tr><td><span>out in</span></td>")



	tablePreview.html(output); // let's give the user a preview!
	tablePreview.find("table").addClass('pure-table pure-table-striped table-responsive'); // adding twitter bootstrap style to make it purdy.
	tablePreview.find("table").attr("id", 'preview-table');
	new Tablesort(document.getElementById('preview-table'));
	$('.output').removeClass('hidden'); // show it!


	writeFile();
	
}

// let's work on some interactive features

// only see the caption text field when it's necessary.
$('#optCaption').change(function() {
	$('.caption').toggleClass('hidden');
});

// display the success message
function showSuccess() {
	$('.alerts .alert-success').removeClass('hidden');
}

// display the error message (specific to MIME types)
function showError() {
	$('.alerts .alert-danger').removeClass('hidden');
}

// hides all errors!
function hideErrors() {
	$('.alerts .alert').addClass('hidden');
}

$('.button-caption-help').click(function(e){
	e.preventDefault();
	$('.captionDescription').toggleClass('hidden');
});

$('.preview-csv-contents').click(function(e){
	e.preventDefault();
	$('.csv-text-container').toggleClass('hidden');
});

$('#btn-upload').click(function(e) {
	e.stopPropagation();
	e.preventDefault();
	$("#fileInput").click();

});

// takes a file added through the HTML5 File API and add contents to the textarea
function displayFileContents(file) {
	var output = $('#csvText');
	output.val('');
	
	var mimeTypes = ["text/comma-separated-values", "text/csv", "application/csv", "application/excel", "application/vnd.ms-excel", "application/vnd.msexcel", "text/anytext"];
	if ($.inArray(file.type,mimeTypes) > -1) {

		var reader = new FileReader();

		reader.onload = function(e) {
			output.val(reader.result);
		};

		reader.readAsText(file);
		showSuccess();
		$('.step2').removeClass('hidden');
		$('.csv-file-contents').removeClass('hidden');
	}
	else {
		
		showError();
	}
	return false;
}




// file drag and drop support!!

if (window.File && window.FileReader) {

	var fileDrop = document.getElementById('filedrop');
	var fileInput = document.getElementById('fileInput');

	$('.file-container').removeClass('hidden');
	$('label.csv-text').html('Your CSV file contents:');
	$('.csv-file-contents').addClass('hidden');
	
	fileDrop.className = 'visible';

	// change visible state when hovering
	fileDrop.ondragover = function() {
		this.className = 'hover';
		return false;
	};
	
	// revert visible state when done
	fileDrop.ondragend = function() {
		this.className = '';
		return false;
	};

	// when file is dropped in the item
	fileDrop.ondrop = function(e) {
		hideErrors();
		this.className = '';
		e.preventDefault();

		var file = e.dataTransfer.files[0];
		
		// let's track which file method people are using for future UI improvements
		_gaq.push(['_trackEvent', 'Upload', 'Method', 'Drag and drop']);
		
		displayFileContents(file);
		
		return false;
	};

	fileInput.addEventListener('change', function(e) {
		hideErrors();

		var file = fileInput.files[0];

		// let's track which file method people are using for future UI improvements
		_gaq.push(['_trackEvent', 'Upload', 'Method', 'File Input']);
		
		displayFileContents(file);
		return false;
	});
}





