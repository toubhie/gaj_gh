$(document).ready(function(){

    $('.register_section_link > #candidate_form_link').click(function(){

        $(".register_section_link div").not(this).removeClass("active");
        $(this).addClass("active");
    
        $("#employer_form").not("#candidate_form").fadeOut(300);    
        $("#candidate_form").delay(300).fadeIn();  
    })

    $('.register_section_link > #employer_form_link').click(function(){

        $(".register_section_link div").not(this).removeClass("active");
        $(this).addClass("active");
    
        $("#candidate_form").not("#employer_form").fadeOut(300);    
        $("#employer_form").delay(300).fadeIn();  
    })
    

    var container_width = 340 * $(".job").length;
    $(".jobs_slider_wrapper").css("width", container_width+"px");

    // dashboard Script 

    $('#create_account_link').click(function(e){
        e.preventDefault();

        // $(".register_section_link div").not(this).removeClass("active");
        $(this).addClass("active");
    
        $("[id*='dashB_wellcome_']").not("#dashB_wellcome_create_account").fadeOut(300);    
        $("#dashB_wellcome_create_account").delay(300).fadeIn();  
    })

    $('#upload_resume_link').click(function(e){
        e.preventDefault();

        // $(".register_section_link div").not(this).removeClass("active");
        $(this).addClass("active");
    
        $("[id*='dashB_wellcome_']").not("#dashB_wellcome_upload_resume").fadeOut(300);    
        $("#dashB_wellcome_upload_resume").delay(300).fadeIn();  
    })

    $('#start_applying_link').click(function(e){
        e.preventDefault();

        // $(".register_section_link div").not(this).removeClass("active");
        $(this).addClass("active");
    
        $("[id*='dashB_wellcome_']").not("#dashB_wellcome_start_applying").fadeOut(300);    
        $("#dashB_wellcome_start_applying").delay(300).fadeIn();  
    })


    $('.dashboard_links a').click(function(){
        // e.preventDefault();

        $(".dashboard_links a").not(this).removeClass("active");
        $(this).addClass("active");
          
    })

    // New-----------

    // $('.profile_reg_progress > div').click(function(e){
    //     e.preventDefault();

    //     // $("step_one_link").not(this).removeClass("active");
    //     $(this).addClass("active");
     
    // })

    // $('.step_one_link').click(function(e){
    //     e.preventDefault();
    
    //     $("[id*='form_step_']").not("#form_step_one").fadeOut(300);    
    //     $("#form_step_one").delay(300).fadeIn();  
    // })

    // $('.step_two_link').click(function(e){
    //     e.preventDefault();
    
    //     $("[id*='form_step_']").not("#form_step_three").fadeOut(300);    
    //     $("#form_step_three").delay(300).fadeIn();  

    // })

    // $('.step_three_link').click(function(e){
    //     e.preventDefault();
    
    //     $("[id*='form_step_']").not("#form_step_five").fadeOut(300);    
    //     $("#form_step_five").delay(300).fadeIn();  
    // })

    // $('.step_four_link').click(function(e){
    //     e.preventDefault();
    
    //     $("[id*='form_step_']").not("#form_step_seven").fadeOut(300);    
    //     $("#form_step_seven").delay(300).fadeIn();  
    // })



    $('#goto_next_two').click(function(e){
        e.preventDefault();

        $("[class*='profile_form_header']").not(".step_two_header").fadeOut(300);    
        $(".step_two_header").delay(300).fadeIn(); 
    
        $("[id*='form_step_']").not("#form_step_two").fadeOut(300);    
        $("#form_step_two").delay(300).fadeIn();  
    })


    $('#goto_next_three').click(function(e){
        e.preventDefault();

        $('.profile_reg_progress > div.step_two_link').addClass("active");
    
        $("[class*='profile_form_header']").not(".step_three_four_header").fadeOut(300);    
        $(".step_three_four_header").delay(300).fadeIn();

        $("[id*='form_step_']").not("#form_step_three").fadeOut(300);    
        $("#form_step_three").delay(300).fadeIn();  
    })

    $('#goto_next_four').click(function(e){
        e.preventDefault();

        $("[class*='profile_form_header']").not(".step_three_four_header").fadeOut(300);    
        $(".step_three_four_header").delay(300).fadeIn();
    
        $("[id*='form_step_']").not("#form_step_four").fadeOut(300);    
        $("#form_step_four").delay(300).fadeIn();  
    })

    $('#goto_next_five').click(function(e){
        e.preventDefault();

        $('.profile_reg_progress > div.step_three_link').addClass("active");
    
        $("[class*='profile_form_header']").not(".step_five_header").fadeOut(300);    
        $(".step_five_header").delay(300).fadeIn();
        
        $("[id*='form_step_']").not("#form_step_five").fadeOut(300);    
        $("#form_step_five").delay(300).fadeIn();  
    })


    $('#goto_next_six').click(function(e){
        e.preventDefault();

        $("[class*='profile_form_header']").not(".step_five_header").fadeOut(300);    
        $(".step_five_header").delay(300).fadeIn();
    
        $("[id*='form_step_']").not("#form_step_six").fadeOut(300);    
        $("#form_step_six").delay(300).fadeIn();  
    })

    $('#goto_next_seven').click(function(e){
        e.preventDefault();

        $('.profile_reg_progress > div.step_four_link').addClass("active");
    
        $("[class*='profile_form_header']").not(".step_six_header").fadeOut(300);    
        $(".step_six_header").delay(300).fadeIn();

        $("[id*='form_step_']").not("#form_step_seven").fadeOut(300);    
        $("#form_step_seven").delay(300).fadeIn();  
    })


    

    // End of dashboard Script


})


var w = window.innerWidth;
    var h = window.innerHeight;
    console.log(`

        The Screen width is : ${w}px
        The Screen height is : ${h}px
    
    `)