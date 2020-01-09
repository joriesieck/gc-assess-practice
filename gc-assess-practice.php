<?php
/*
   Plugin Name: Master GC Assess Practice
   Version: 1.0.0
   Author: Global Cognition
   Author URI: https://www.globalcognition.org
   Description: Serve up exemplars to practice competency assessments
   Text Domain: gc-assess-prac
   License: GPLv3
*/

defined( 'ABSPATH' ) or die( 'No direct access!' );

include_once 'assets/lib/cpt-setup.php';
include_once 'assets/lib/judgments-db.php';
// Call gcap_create_table on plugin activation.
register_activation_hook(__FILE__,'gcap_create_table'); // this function call has to happen here


function gc_assess_prac_enqueue_scripts() {

  if( is_page( 'competency-assessment-practice' ) ) {

      global $current_user;
      get_currentuserinfo();
      if ( $current_user->ID) {

          wp_enqueue_script(
              'gcap-main-js',
              plugins_url('/assets/js/main.js', __FILE__),
              ['wp-element', 'wp-components', 'jquery'],
              time(),
              true
          );
          
          $comp_task_num = sanitize_text_field(get_query_var('comp_task_num'));
          list($comp_num, $task_num) = explode(",", $comp_task_num);
          $data_for_js = pull_data_cpts($comp_num,$task_num);
          $other_data = array(
              'compNum' => $comp_num,
              'taskNum' => $task_num
            );
          $data_for_js = array_merge($data_for_js,$other_data);
        // pass exemplars, scenarios, and competencies to Judgment App
          wp_localize_script('gcap-main-js', 'exObj', $data_for_js);

      } else {
          echo "please log in";
      }

  }
}
add_action( 'wp_enqueue_scripts', 'gc_assess_prac_enqueue_scripts' );


function gc_assess_prac_enqueue_styles() {

  wp_enqueue_style(
    'gcap-main-css',
    plugins_url( '/assets/css/main.css', __FILE__ ),
    [],
    time(),
    'all'
  );

}
add_action( 'wp_enqueue_scripts', 'gc_assess_prac_enqueue_styles' );


function gcap_add_scores( ) {

    global $current_user;
    get_currentuserinfo();
    if ( $current_user->ID) {

        check_ajax_referer('gcap_scores_nonce');

        $scores = $_POST['scores'];
        $percent_correct = round(array_sum($scores) / count($scores) , 2);
        update_user_meta($current_user->ID, 'percent_correct', $percent_correct );
        $retrieved_pc = get_user_meta($current_user->ID, 'percent_correct', true);

        if ($percent_correct == $retrieved_pc) {
            echo $percent_correct;
        }
    }
    die();

}
add_action( 'wp_ajax_gcap_add_scores', 'gcap_add_scores' );

// Add comp_num and task_num to url, formatted as 'comp_num,task_num'
function comp_task_query_vars( $qvars ) {
    $qvars[] = 'comp_task_num';
    return $qvars;
}
add_filter( 'query_vars', 'comp_task_query_vars' );

// Genesis activation hook - if statement in function has it run only on a given page
add_action('wp_ajax_save_data','save_data');
/*
 * Calls the insert function from the class judg_db to insert exemplar data into the table
 */
function save_data() {
    check_ajax_referer('gcap_scores_nonce');
    global $current_user;
    $db = new judg_db;
    // Get data from React components
    $trial_num = $_POST['trial_num'];
    $comp_num = $_POST['comp_num'];
    $task_num = $_POST['task_num'];
    $ex_id = $_POST['ex_id'];
    $learner_level = $_POST['learner_level'];
    $gold_level = $_POST['gold_level'];
    $judg_corr = $_POST['judg_corr'];
    $judg_time = $_POST['judg_time'];
    $learner_rationale = $_POST['learner_rationale'];
    $ration_match = $_POST['ration_match'];
    $ration_time = $_POST['ration_time'];

    if($judg_time>=60) {
        $judg_time = date("H:i:s", mktime(0, 0, $judg_time));
    }
    if($ration_time>=60) {
        $ration_time = date("H:i:s", mktime(0, 0, $ration_time));
    }

    $db_data = array(
        'learner_id' => $current_user->ID,
        'trial_num' => $trial_num,
        'comp_num' => $comp_num,
        'task_num' => $task_num,
        'ex_title' => get_the_title($ex_id),
        'learner_level' => $learner_level,
        'gold_level' => $gold_level,
        'judg_corr' => $judg_corr,
        'judg_time'  => $judg_time,
        'learner_rationale' => $learner_rationale,
        'ration_match' => $ration_match,
        'ration_time' => $ration_time
    );
    $db->insert($db_data);
}


require_once( 'assets/lib/plugin-page.php' );


?>
