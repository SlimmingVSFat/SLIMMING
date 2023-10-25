$(document).ready(function() {
	$(".top_menu li").click(function() {
		flag = $(this).index()
		if (flag == 0) {
			flag = 3
			$(".main_content li").removeClass("aa").eq(flag).addClass("aa");
			// $(".reproduction").hide("slow");
		}  else if (flag == 1) {
			flag = 2
			$(".main_content li").removeClass("aa").eq(flag).addClass("aa");
			// $(".reproduction").hide("slow");
		} else if (flag == 2) {
			flag = 1
			$(".main_content li").removeClass("aa").eq(flag).addClass("aa");
			// $(".reproduction").hide("slow");
		} else {
			flag = 0
			$(".main_content li").removeClass("aa").eq(flag).addClass("aa");
			// $(".reproduction").hide("slow");
		}
	});
	$("#start").click(function() {
		$(".head_menu").removeClass("active");
		$(".head_menu").eq(3).addClass("active");
		$(".reproduction").hide("slow");
		$(".main_content li").removeClass("aa").eq(1).addClass("aa");
	});

	$("#How").click(function() {
		$(".head_menu").removeClass("active");
		$(".head_menu").eq(0).addClass("active");
		$(".reproduction").hide("slow");
		$(".main_content li").removeClass("aa").eq(3).addClass("aa");
	});
})
