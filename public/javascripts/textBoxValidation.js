$(function () {
	$("#btnSubmit").click(function () {
		var textVal = $("input[id='tbData']").val();
		if(textVal == '') {
			$("#tbData").addClass("outline");
		}else{
			$("#tbData").removeClass("outline");
			$("#tbData").addClass("outline-off");
		} 
		$("#tbData").focus();
	});
});