if (networkEnabled) {
  var url = 'https://' + explorer
  var githubRepo = 'https://api.github.com/repos/stakecube/StakeCubeProtocol/releases';

  var getBlockCount = function() {
    var request = new XMLHttpRequest();
    request.open('GET', "https://stakecubecoin.net/web3/blocks", true);
    request.onload = function () {
      let data = Number(this.response);
      // If the block count has changed, refresh all of our data!
      if (data > cachedBlockCount) {
        console.log("New block detected! " + cachedBlockCount + " --> " + data);
        if (pubkeyMain)
          getUnspentTransactions();
      }
      cachedBlockCount = data;
    }
    request.send();
  }
  var getUnspentTransactions = function () {
    var request = new XMLHttpRequest()
    request.open('GET', "https://stakecubecoin.net/web3/getutxos?addr=" + pubkeyMain, true)
    request.onload = function () {
      data = JSON.parse(this.response)
      if (data.length === 0) {
        console.log('No unspent Transactions');
        cachedUTXOs = [];
        // Update SCP-1 token balances anyway!
        balance = getBalance(true);
      } else {
        cachedUTXOs = [];
        amountOfTransactions = data.length;
        if (amountOfTransactions > 0)
          //document.getElementById("errorNotice").innerHTML = '';
        if (amountOfTransactions <= 1000) {
          for (i = 0; i < amountOfTransactions; i++) {
            cachedUTXOs.push(data[i]);
          }
          // Update the GUI with the newly cached UTXO set
          balance = getBalance(true);
        } else {
          //Temporary message for when there are alot of inputs
          //Probably use change all of this to using websockets will work better
          //document.getElementById("errorNotice").innerHTML = '<div class="alert alert-danger" role="alert"><h4>Note:</h4><h5>This address has over 1000 UTXOs, which may be problematic for the wallet to handle, transact with caution!</h5></div>';
        }
      }
      console.log('Total Balance:' + balance);
    }
    request.send()
  }
  var sendTransaction = function (hex) {
    if (typeof hex !== 'undefined') {
      var request = new XMLHttpRequest()
      request.open('GET', 'https://stakecubecoin.net/web3/submittx?tx=' + hex, true)
      request.onload = function () {
        data = this.response;
        if (data.length === 64) {
          console.log('Transaction sent! ' + data);
          document.getElementById("transactionFinal").innerHTML = ('<h4 style="color:green">Transaction sent! ' + data + '</h4>');
          document.getElementById("address1s").innerHTML = '';
          document.getElementById("value1s").innerHTML = '';
        } else {
          console.log('Error sending transaction: ' + data);
          document.getElementById("transactionFinal").innerHTML = ('<h4 style="color:red">Error sending transaction: ' + data + "</h4>");
        }
      }

      request.send()
    } else {
      console.log("hex undefined");
    }
  }
  var calculatefee = function (bytes) {
    // TEMPORARY: Hardcoded fee per-byte
    fee = Number(((bytes * 250) / 100000000).toFixed(8)); // 250 sats/byte

    /*var request = new XMLHttpRequest()
    request.open('GET', url + '/api/v1/estimatefee/10', false)
    request.onload = function () {
      data = JSON.parse(this.response)
      console.log(data);
      console.log('current fee rate' + data['result']);
      fee = data['result'];
    }
    request.send()*/
  }
  var versionCheck = function () {
    var request = new XMLHttpRequest()
    request.open('GET', githubRepo, true)
    request.onload = function () {
      data = JSON.parse(this.response)
      var currentReleaseVersion = (data[0]['tag_name']).replace("V", "")
      if (parseFloat(currentReleaseVersion) > parseFloat(wallet_version)) {
        console.log("out of date");
        document.getElementById("outdated").style.display = 'block';
      }
    }
    request.send()
  }
  //Call a version check if network is enabled:
  //versionCheck();
}
