<?php
/*
 * Plugin Name:       NFTGate
 * Plugin URI:        https://kedruga.com/nft-gate
 * Description:       Onramp web2 users to web3 through NFT fiat checkout.
 * Version:           1.0.0
 * Requires at least: 5.2
 * Requires PHP:      7.2
 * Author:            Musab Shakil
 * Author URI:        https://kedruga.com
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Update URI:        https://kedruga.com/nft-gate
 * Text Domain:       nft-gate
 * Domain Path:       /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

global $nftgate_version;
$nftgate_version = '1.0.0';

// Enqueue
add_action( 'admin_enqueue_scripts', 'nftgate_enqueue_admin_scripts' );
function nftgate_enqueue_admin_scripts() {
	wp_enqueue_style( 'datatables-css', 'https://cdn.datatables.net/v/dt/dt-1.13.6/datatables.min.css' );
	wp_enqueue_style( 'nftgate-admin-css', plugin_dir_url( __FILE__ ) . 'admin/css/nftgate-admin.css' );

	wp_enqueue_script( 'datatables-js', 'https://cdn.datatables.net/v/dt/dt-1.13.6/datatables.min.js' );
	wp_enqueue_script( 'nftgate-admin-js', plugin_dir_url( __FILE__ ) . 'admin/js/nftgate-admin.js', array( 'jquery' ) );
}

add_action( 'wp_enqueue_scripts', 'nftgate_enqueue_public_scripts' );
function nftgate_enqueue_public_scripts() {
	wp_enqueue_style( 'nftgate-public-css', plugin_dir_url( __FILE__ ) . 'public/css/nftgate-public.css' );
	wp_enqueue_style( 'google-fonts', 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap', false );

	wp_enqueue_script( 'crossmint-js', 'https://unpkg.com/@crossmint/client-sdk-vanilla-ui@1.0.0-alpha.1/lib/index.global.js' );
	wp_enqueue_script( 'nftgate-public-js', plugin_dir_url( __FILE__ ) . 'public/js/nftgate-public.js', array( 'jquery' ) );

	wp_add_inline_script( 'nftgate-public-js', 'const NFTGATE_ADMIN_SCRIPT = ' . json_encode(array(
		'ajaxUrl' => admin_url( 'admin-ajax.php' ),
		'nonce' => wp_create_nonce( 'nftgate-nonce' ),
	)), 'before' );
}

// Admin Page
add_action( 'admin_menu', 'nftgate_options_page' );
function nftgate_options_page() {
	add_menu_page(
		'NFTGate',
		'NFTGate',
		'manage_options',
		'nftgate',
		'nftgate_options_page_html',
		plugin_dir_url(__FILE__) . 'assets/nftgate-logo.png',
		20
	);
}
function nftgate_options_page_html() {
	?>
	<div class="wrap nftgate-dashboard"></div>
	<?php
}

// API
add_action( 'wp_ajax_nopriv_nftgate_api_mint', 'nftgate_api_mint' );
add_action( 'wp_ajax_nftgate_api_mint', 'nftgate_api_mint' );
function nftgate_api_mint() {
	check_ajax_referer( 'nftgate-nonce' );

	$email = wp_unslash( $_POST['email'] );
	$wallet = wp_unslash( $_POST['wallet'] );

	global $wpdb;
	$nftgate_mint_customers_table = $wpdb->prefix . 'nftgate_mint_customers';

	$wpdb->insert( 
		$nftgate_mint_customers_table, 
		array(
			'email_address' => $email,
			'wallet_address' => $wallet,
		) 
	);

	wp_die();
}

add_action( 'wp_ajax_nftgate_get_users_and_nfts', 'nftgate_get_users_and_nfts' );
function nftgate_get_users_and_nfts() {
	global $wpdb;
	$nftgate_mint_customers_table = $wpdb->prefix . 'nftgate_mint_customers';
	$ALCHEMY_API_KEY = "";
	$contracts = array(
		"value" => strtolower(""),
		"gold" => strtolower(""),
		"platinum" => strtolower(""),
	);
	$response = array();

	$mintCustomers = $wpdb->get_results( 
		$wpdb->prepare( "SELECT email_address, wallet_address FROM $nftgate_mint_customers_table" ) 
	);

	foreach($mintCustomers as $mintCustomerKey => $mintCustomer) {
		$curr = array();

		$curr["email"] = $mintCustomer->email_address;
		$curr["wallet"] = $mintCustomer->wallet_address;
		foreach($contracts as $contractKey => $contract) {
			$temp[$contract] = array();
		}

		$getNfts = json_decode(wp_remote_retrieve_body( wp_remote_get( 'https://polygon-mumbai.g.alchemy.com/nft/v2/'.$ALCHEMY_API_KEY.'/getNFTs?owner='.$mintCustomer->wallet_address.'&contractAddresses[]='.$contracts["value"].'&contractAddresses[]='.$contracts["gold"].'&contractAddresses[]='.$contracts["platinum"].'&withMetadata=false&pageSize=100' ) ), true);
		$getOwnedNfts = $getNfts["ownedNfts"];

		foreach($getOwnedNfts as $getOwnedNftKey => $getOwnedNft) {
			$ownedNftContract = $getOwnedNft["contract"]["address"];
			$ownedNftId = hexdec($getOwnedNft["id"]["tokenId"]);
			array_push($temp[$ownedNftContract], $ownedNftId);
		}

		foreach($contracts as $contractKey => $contract) {
			$curr[$contractKey] = implode(", ", $temp[$contract]);
		}

		array_push($response, $curr);
	}

	wp_send_json_success( $response, 200 );
}

// Database
register_activation_hook( __FILE__, 'nftgate_init_db' );
function nftgate_init_db() {
	global $nftgate_version;
	global $wpdb;
	$nftgate_mint_customers_table = $wpdb->prefix . 'nftgate_mint_customers';
	
	$charset_collate = $wpdb->get_charset_collate();

	$sql = "CREATE TABLE $nftgate_mint_customers_table (
		id int NOT NULL AUTO_INCREMENT,
		email_address varchar(255),
		wallet_address varchar(255),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
		PRIMARY KEY (id),
		CONSTRAINT uc_email_wallet UNIQUE (email_address, wallet_address)
	) $charset_collate;";

	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	dbDelta( $sql );

	add_option( 'nftgate_version', $nftgate_version );
}

register_uninstall_hook(__FILE__, 'nftgate_delete_db');
function nftgate_delete_db() {
	global $wpdb;
	$nftgate_mint_customers_table = $wpdb->prefix . 'nftgate_mint_customers';

	$sql = "DROP TABLE IF EXISTS $nftgate_mint_customers_table";
	
	$wpdb->query($sql);
	delete_option('nftgate_version');
}
