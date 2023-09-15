(function ($) {
  $(function () {
    $(".nftgate-dashboard").html(
      `<table id="nftgate-table" class="cell-border">
          <thead>
            <tr>
              <th>Email</th>
              <th>Wallet</th>
              <th>Value</th>
              <th>Gold</th>
              <th>Platinum</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>abc@example.com</td>
              <td>0x123</td>
              <td>1, 5, 6</td>
              <td>2, 4</td>
              <td>1, 3</td>
            </tr>
          </tbody>
        </table>`
    )

    $('#nftgate-table').DataTable({
      "ajax": {
        url: ajaxurl,
        data: { action: "nftgate_get_users_and_nfts" },
        type: "POST",
      },
      columns: [
        { data: 'email', "defaultContent": "" },
        { data: 'wallet', "defaultContent": "" },
        { data: 'value', "defaultContent": "" },
        { data: 'gold', "defaultContent": "" },
        { data: 'platinum', "defaultContent": "" },
      ]
    });
  });
})(jQuery);
