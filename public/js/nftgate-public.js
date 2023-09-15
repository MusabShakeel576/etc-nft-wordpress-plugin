(function ($) {
  $(function () {
    // MINT
    const environment = "";
    const crossmintPayButtonConfig = {
      0: {
        collectionId: "",
        projectId: "",
        mintConfig: {
          type: "erc-721",
          totalPrice: "",
        }
      },
      1: {
        collectionId: "",
        projectId: "",
        mintConfig: {
          type: "erc-721",
          totalPrice: "",
        }
      },
      2: {
        collectionId: "",
        projectId: "",
        mintConfig: {
          type: "erc-721",
          totalPrice: "",
        }
      },
    }
    const paymentMethod = {
      "fiat": "fiat",
      "eth": "ETH",
      "sol": "SOL"
    }
    const terms =
      "Please tick this box to accept terms and conditions. By minting any of the: Value, Gold, Platinum ETC NFT, you are accepting the ETC Terms and Conditions here:"
    const termsLink = "https://nft.lingouni.com/terms"
    const mainsiteLink = "https://lingouni.com"

    const crossmintEthPayButton = id => `<crossmint-pay-button
      collectionId='${crossmintPayButtonConfig[id].collectionId}'
      projectId='${crossmintPayButtonConfig[id].projectId}'
      mintConfig='${JSON.stringify(crossmintPayButtonConfig[id].mintConfig)}'
      environment='${environment}'
      paymentMethod='${paymentMethod.eth}'
      successCallbackURL='${window.location.origin + "/nftgate-success"}'
    />`

    const crossmintFiatPayButton = id => `<crossmint-pay-button
      collectionId='${crossmintPayButtonConfig[id].collectionId}'
      projectId='${crossmintPayButtonConfig[id].projectId}'
      mintConfig='${JSON.stringify(crossmintPayButtonConfig[id].mintConfig)}'
      environment='${environment}'
      paymentMethod='${paymentMethod.fiat}'
      successCallbackURL='${window.location.origin + "/nftgate-success"}'
    />`

    const modal = id => `
    <div class="nftgate-modal nftgate-modal__background nftgate-modal--mint">
      <div class="nftgate-modal__header nftgate-modal__background">
        ETC NFTGate
        <a href="#" class="nftgate-close-modal">&#10005;</a>
      </div>
      <div class="nftgate-modal__content">
        <label class="nftgate-container">
          ${terms}
          <a href=${termsLink} target="_blank">${termsLink}</a>
          <input type="checkbox" name="nftgate-checkbox--mint">
          <span class="nftgate-checkmark"></span>
        </label>
        <p class="nftgate-modal__note">Please note the transaction will be done in a pop up window. If it does not appear or disappears from your screen, please check all active windows in your browser!</p>
        <div class="nftgate-button__wrapper">
          <div>
            ${crossmintEthPayButton(id)}
          </div>
          <div>
            ${crossmintFiatPayButton(id)}
          </div>
        </div>
      </div>
    </div>
    `

    function removeMintModal() {
      // Remove id from params
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      params.delete('nftgate-id');
      window.history.replaceState({}, '', `${window.location.pathname}?${params}`);

      // Remove modal
      $(".nftgate-modal__holder--mint").remove();
    }

    function mintModal(id) {
      // Remove modal if it already exists
      $(".nftgate-modal__holder--mint").remove();

      $('<div/>', {
        class: 'nftgate-modal__holder--mint'
      }).appendTo('body');

      $(".nftgate-modal__holder--mint").html(modal(id))

      $(".nftgate-close-modal").click(function () {
        removeMintModal();
      });

      $('input[name="nftgate-checkbox--mint"]').click(function () {
        if ($('input[name="nftgate-checkbox--mint"]:checked').val()) {
          $(".nftgate-button__wrapper").addClass("nftgate-button__wrapper-visible");
          $(".nftgate-modal__note").addClass("nftgate-visible");
        } else {
          $(".nftgate-button__wrapper").removeClass("nftgate-button__wrapper-visible");
          $(".nftgate-modal__note").removeClass("nftgate-visible");
        }
      })

      // Update Crossmint Pay Button
      setTimeout(() => {
        const crossmintPayButtons = document.querySelectorAll("crossmint-pay-button")
        for (const crossmintPayButton of crossmintPayButtons) {
          const crossmintPayButtonShadowRoot = crossmintPayButton.shadowRoot

          const style = document.createElement("style");
          style.appendChild(document.createTextNode(`
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@900&display=swap')
              font-family: 'Poppins', sans-serif;
              button {
                font-family: "Poppins", Sans-serif !important;
                background: #9057C7 !important;
              }
              img {
                display: none !important;
              }`
          ));
          crossmintPayButtonShadowRoot.prepend(style);

          crossmintPayButtonShadowRoot.querySelector("button").addEventListener("click", function () {
            removeMintModal();
          });
        }
      }, 200)
    }

    const mintUrlParams = new URLSearchParams(window.location.search);
    const mintTokenId = mintUrlParams.get('nftgate-id');

    if (mintTokenId) {
      mintModal(mintTokenId)
    }

    $(".nftgate-open-modal").click(function () {
      mintModal($(this).data("nftgate-id"))
    });

    $(document).click(function (event) {
      //if you click on anything except the modal itself or the "open modal" link, close the modal
      if (!$(event.target).closest(".nftgate-modal--mint,.nftgate-open-modal").length) {
        removeMintModal();
      }
    });

    // EMAIL
    const successCallbackURLParams = new URLSearchParams(window.location.search);
    const successCallbackURLParam = successCallbackURLParams.get('p');
    const successCallbackURLParsedParam = JSON.parse(successCallbackURLParam);

    if (
      successCallbackURLParsedParam &&
      successCallbackURLParsedParam.length &&
      successCallbackURLParsedParam[0].walletAddress
    ) {
      const walletAddress = successCallbackURLParsedParam[0].walletAddress;
      localStorage.setItem("walletAddress", walletAddress);

      const emailModal = `
      <div class="nftgate-modal nftgate-modal__background nftgate-modal--email">
        <div class="nftgate-modal__header nftgate-modal__background">
          ETC NFTGate
        </div>
        <div class="nftgate-modal__content nftgate-modal__content--email">
          <form class="nftgate-form--email">
            <label for="nftgate-email">Please type your email here for NFT membership registration purpose</label>
            <input type="email" class="nftgate-input--email" name="nftgate-email" placeholder="Email address">
            <input type="email" class="nftgate-input--email" name="nftgate-email--confirm" placeholder="Confirm email address">
            <input type="submit" class="nftgate-submit--email" value="Submit">
          </form>
          <div class="nftgate-form__error__holder--email"></div>
        </div>
      </div>
      `

      $('<div/>', {
        class: 'nftgate-modal__holder--email'
      }).appendTo('body');

      $(".nftgate-modal__holder--email").html(emailModal)
      $(".nftgate-modal--email").addClass("nftgate-visible");

      $(".nftgate-form--email").submit(function (e) {
        e.preventDefault();
        const email = $('[name="nftgate-email"]').val()
        const confirmEmail = $('[name="nftgate-email--confirm"]').val()
        const wallet = walletAddress || localStorage.getItem("walletAddress");

        if (email !== confirmEmail) {
          $(".nftgate-form__error__holder--email").html(
            `<div class="nftgate-form__message_box nftgate-form__error--email">
              <p>Emails don't match!</p>
            </div>`
          )
        }

        if (
          email &&
          confirmEmail &&
          wallet &&
          email === confirmEmail
        ) {
          $(".nftgate-modal__content--email").html(
            `<div class="nftgate-form__message_box nftgate-email__message">
              <p>You've successfully completed your NFT minting journey!</p>
              <a href="${mainsiteLink}">Back to main site &gt;</a>
            </div>`
          );

          $.post(NFTGATE_ADMIN_SCRIPT.ajaxUrl, {
            _ajax_nonce: NFTGATE_ADMIN_SCRIPT.nonce,
            action: "nftgate_api_mint",
            email,
            wallet,
          }, function (data) {
            console.log("Data has been saved.");
          });
        }
      })
    }
  });
})(jQuery);
