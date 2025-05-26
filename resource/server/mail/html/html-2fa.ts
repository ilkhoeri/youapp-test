export const HTML2FA = ({ token, domain }: { token: string; domain: string | undefined }) => `<table
        id="m_2725105697623234912u_body"
        style="border-collapse:collapse;table-layout:fixed;border-spacing:0;vertical-align:top;min-width:320px;Margin:0 auto;background-color:#ffffff;width:100%"
        cellpadding="0"
        cellspacing="0"
      >
        <tbody>
          <tr style="vertical-align:top">
            <td style="word-break:break-word;border-collapse:collapse!important;vertical-align:top">
              <div class="m_2725105697623234912u-row-container" style="padding:0px;background-color:transparent">
                <div
                  class="m_2725105697623234912u-row"
                  style="margin:0 auto;min-width:320px;max-width:600px;word-wrap:break-word;word-break:break-word;background-color:#003399"
                >
                  <div style="border-collapse:collapse;display:table;width:100%;height:100%;background-color:transparent">
                    <div
                      class="m_2725105697623234912u-col m_2725105697623234912u-col-100"
                      style="max-width:320px;min-width:600px;display:table-cell;vertical-align:top"
                    >
                      <div style="background-color:#f49104;height:100%;width:100%!important">
                        <div style="box-sizing:border-box;height:100%;padding:0px;border-top:0px solid transparent;border-left:0px solid transparent;border-right:0px solid transparent;border-bottom:0px solid transparent">
                          <table
                            id="m_2725105697623234912u_content_image_2"
                            style="font-family:'Cabin',sans-serif"
                            role="presentation"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                            border="0"
                          >
                            <tbody>
                              <tr>
                                <td
                                  class="m_2725105697623234912v-container-padding-padding"
                                  style="word-break:break-word;padding:40px 10px 10px;font-family:'Cabin',sans-serif"
                                  align="left"
                                >
                                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tbody>
                                      <tr>
                                        <td style="padding-right:0px;padding-left:0px" align="center">
                                          <img
                                            align="center"
                                            border="0"
                                            src="https://raw.githubusercontent.com/ioeridev/assets/public/mail/2FA-header.png"
                                            alt="Image"
                                            title="Image"
                                            style="outline:none;text-decoration:none;clear:both;display:inline-block!important;border:none;height:auto;float:none;width:35%;max-width:180px"
                                            width="150.8"
                                            class="m_-411738162422932988v-src-width m_-411738162422932988v-src-max-width CToWUd"
                                            data-bit="iit"
                                          >
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table
                            style="font-family:'Cabin',sans-serif"
                            role="presentation"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                            border="0"
                          >
                            <tbody>
                              <tr>
                                <td
                                  class="m_2725105697623234912v-container-padding-padding"
                                  style="word-break:break-word;padding:0px 10px 31px;font-family:'Cabin',sans-serif"
                                  align="left"
                                >
                                  <div style="font-size:14px;color:#e5eaf5;line-height:140%;text-align:center;word-wrap:break-word">
                                    <p style="font-size:14px;line-height:140%">
                                      <span style="font-size:28px;line-height:39.2px">
                                        <strong>
                                          <span style="line-height:39.2px;font-size:32px;color: #000;">
                                            Two Factor Authentication Code
                                          </span>
                                        </strong>
                                      </span>
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="m_2725105697623234912u-row-container" style="padding:0px;background-color:transparent">
                <div
                  class="m_2725105697623234912u-row"
                  style="margin:0 auto;min-width:320px;max-width:600px;word-wrap:break-word;word-break:break-word;background-color:#ffffff"
                >
                  <div style="border-collapse:collapse;display:table;width:100%;height:100%;background-color:transparent">
                    <div
                      class="m_2725105697623234912u-col m_2725105697623234912u-col-100"
                      style="max-width:320px;min-width:600px;display:table-cell;vertical-align:top"
                    >
                      <div style="height:100%;width:100%!important">
                        <div style="box-sizing:border-box;height:100%;padding:0px;border-top:0px solid transparent;border-left:0px solid transparent;border-right:0px solid transparent;border-bottom:0px solid transparent">
                          <table
                            style="font-family:'Cabin',sans-serif"
                            role="presentation"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                            border="0"
                          >
                            <tbody>
                              <tr>
                                <td
                                  class="m_2725105697623234912v-container-padding-padding"
                                  style="word-break:break-word;padding:33px 55px;font-family:'Cabin',sans-serif"
                                  align="left"
                                >
                                  <div style="font-size:14px;line-height:160%;text-align:center;word-wrap:break-word">
                                    <p style="font-size:14px;line-height:160%">
                                      <code style="font-size: 20px;line-height:35.2px">Your 2FA code:</code>
                                    </p>
                                    <p style="font-size: 32px;line-height:160%">
                                      <code style="font-size: 38px;line-height: 1.75;letter-spacing: 4px;font-weight: 700;background-color: #d0d6dd;padding: 12px 12px;border-radius: 8px;">
                                        ${token}
                                      </code>
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table
                            style="font-family:'Cabin',sans-serif"
                            role="presentation"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                            border="0"
                          >
                            <tbody>
                              <tr>
                                <td
                                  class="m_2725105697623234912v-container-padding-padding"
                                  style="word-break:break-word;padding:20px 20px 0px 20px;font-family:'Cabin',sans-serif"
                                  align="left"
                                >
                                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tbody>
                                      <tr>
                                        <td style="padding-right:0px;padding-left:0px" align="center">
                                          <a
                                            href="https://github.com/ioeridev"
                                            target="_blank"
                                            rel="noopener noreferrer nofollow"
                                          >
                                            <img
                                              align="center"
                                              border="0"
                                              src="https://raw.githubusercontent.com/ioeridev/assets/public/mail/logo.png"
                                              alt="Image"
                                              title="Image"
                                              style="outline:none;text-decoration:none;clear:both;display:inline-block!important;border:none;height:auto;float:none;width:100%;max-width:75px"
                                              width="75"
                                              class="m_-411738162422932988v-src-width m_-411738162422932988v-src-max-width CToWUd"
                                              data-bit="iit"
                                            >
                                          </a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table
                            style="font-family:'Cabin',sans-serif"
                            role="presentation"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                            border="0"
                          >
                            <tbody>
                              <tr>
                                <td
                                  class="m_2725105697623234912v-container-padding-padding"
                                  style="word-break:break-word;padding:0px 55px 16px;font-family:'Cabin',sans-serif"
                                  align="left"
                                >
                                  <div style="font-size:14px;line-height:160%;text-align:center;word-wrap:break-word">
                                    <p style="line-height:160%;font-size:14px">
                                      <span style="font-size:18px;font-weight:600">
                                        <a
                                          href="https://aoeri.vercel.app"
                                          title="aoeri.dev"
                                          target="_blank"
                                          rel="noopener noreferrer nofollow"
                                        >
                                          aoeri.dev
                                        </a>
                                      </span>
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="m_2725105697623234912u-row-container" style="padding:0px;background-color:transparent">
                <div
                  class="m_2725105697623234912u-row"
                  style="margin:0 auto;min-width:320px;max-width:600px;word-wrap:break-word;word-break:break-word;background-color:#e5eaf5"
                >
                  <div style="border-collapse:collapse;display:table;width:100%;height:100%;background-color:transparent">
                    <div
                      class="m_2725105697623234912u-col m_2725105697623234912u-col-100"
                      style="max-width:320px;min-width:600px;display:table-cell;vertical-align:top"
                    >
                      <div style="background-color:#f4ddc0;height:100%;width:100%!important">
                        <div style="box-sizing:border-box;height:100%;padding:0px;border-top:0px solid transparent;border-left:0px solid transparent;border-right:0px solid transparent;border-bottom:0px solid transparent">
                          <table
                            style="font-family:'Cabin',sans-serif"
                            role="presentation"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                            border="0"
                          >
                            <tbody>
                              <tr>
                                <td
                                  class="m_2725105697623234912v-container-padding-padding"
                                  style="word-break:break-word;padding:41px 55px 18px;font-family:'Cabin',sans-serif"
                                  align="left"
                                >
                                  <div style="font-size:14px;color:#e38704;line-height:160%;text-align:center;word-wrap:break-word">
                                    <p style="font-size:14px;line-height:160%">
                                      <span style="font-size:20px;line-height:32px">
                                        <strong>Connect with us</strong>
                                      </span>
                                    </p>
                                    <p style="font-size:14px;line-height:160%">
                                      <span style="font-size:16px;line-height:25.6px;color:#000000">
                                        +62878 4141 2020
                                      </span>
                                    </p>
                                    <p style="font-size:14px;line-height:160%">
                                      <span style="font-size:16px;line-height:25.6px;color:#000000">
                                        <a href="mailto:aoeri.dev@gmail.com" target="_blank">
                                          aoeri.dev@gmail.com
                                        </a>
                                      </span>
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table
                            style="font-family:'Cabin',sans-serif"
                            role="presentation"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                            border="0"
                          >
                            <tbody>
                              <tr>
                                <td
                                  class="m_2725105697623234912v-container-padding-padding"
                                  style="word-break:break-word;padding:10px 10px 33px;font-family:'Cabin',sans-serif"
                                  align="left"
                                >
                                  <div align="center">
                                    <div style="display:table;max-width:293px">
                                      <table
                                        align="left"
                                        border="0"
                                        cellspacing="0"
                                        cellpadding="0"
                                        width="32"
                                        height="32"
                                        style="width:32px!important;height:32px!important;display:inline-block;border-collapse:collapse;table-layout:fixed;border-spacing:0;vertical-align:top;margin-right:17px"
                                      >
                                        <tbody>
                                          <tr style="vertical-align:top">
                                            <td
                                              align="left"
                                              valign="middle"
                                              style="word-break:break-word;border-collapse:collapse!important;vertical-align:top"
                                            >
                                              <a
                                                href="https://facebook.com/ilkhoeri"
                                                title="Facebook"
                                                target="_blank"
                                                rel="noopener noreferrer nofollow"
                                              >
                                                <img
                                                  src="https://raw.githubusercontent.com/ioeridev/assets/public/mail/facebook.png"
                                                  alt="Facebook"
                                                  title="Facebook"
                                                  width="32"
                                                  style="outline:none;text-decoration:none;clear:both;display:block!important;border:none;height:auto;float:none;max-width:32px!important"
                                                  class="CToWUd"
                                                  data-bit="iit"
                                                >
                                              </a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <table
                                        align="left"
                                        border="0"
                                        cellspacing="0"
                                        cellpadding="0"
                                        width="32"
                                        height="32"
                                        style="width:32px!important;height:32px!important;display:inline-block;border-collapse:collapse;table-layout:fixed;border-spacing:0;vertical-align:top;margin-right:17px"
                                      >
                                        <tbody>
                                          <tr style="vertical-align:top">
                                            <td
                                              align="left"
                                              valign="middle"
                                              style="word-break:break-word;border-collapse:collapse!important;vertical-align:top"
                                            >
                                              <a
                                                href="https://linkedin.com/ilkhoeri"
                                                title="LinkedIn"
                                                target="_blank"
                                                rel="noopener noreferrer nofollow"
                                              >
                                                <img
                                                  src="https://raw.githubusercontent.com/ioeridev/assets/public/mail/linkedin.png"
                                                  alt="LinkedIn"
                                                  title="LinkedIn"
                                                  width="32"
                                                  style="outline:none;text-decoration:none;clear:both;display:block!important;border:none;height:auto;float:none;max-width:32px!important"
                                                  class="CToWUd"
                                                  data-bit="iit"
                                                >
                                              </a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <table
                                        align="left"
                                        border="0"
                                        cellspacing="0"
                                        cellpadding="0"
                                        width="32"
                                        height="32"
                                        style="width:32px!important;height:32px!important;display:inline-block;border-collapse:collapse;table-layout:fixed;border-spacing:0;vertical-align:top;margin-right:17px"
                                      >
                                        <tbody>
                                          <tr style="vertical-align:top">
                                            <td
                                              align="left"
                                              valign="middle"
                                              style="word-break:break-word;border-collapse:collapse!important;vertical-align:top"
                                            >
                                              <a
                                                href="https://instagram.com/ilkhoeri"
                                                title="Instagram"
                                                target="_blank"
                                                rel="noopener noreferrer nofollow"
                                              >
                                                <img
                                                  src="https://raw.githubusercontent.com/ioeridev/assets/public/mail/instagram.png"
                                                  alt="Instagram"
                                                  title="Instagram"
                                                  width="32"
                                                  style="outline:none;text-decoration:none;clear:both;display:block!important;border:none;height:auto;float:none;max-width:32px!important"
                                                  class="CToWUd"
                                                  data-bit="iit"
                                                >
                                              </a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <table
                                        align="left"
                                        border="0"
                                        cellspacing="0"
                                        cellpadding="0"
                                        width="32"
                                        height="32"
                                        style="width:32px!important;height:32px!important;display:inline-block;border-collapse:collapse;table-layout:fixed;border-spacing:0;vertical-align:top;margin-right:17px"
                                      >
                                        <tbody>
                                          <tr style="vertical-align:top">
                                            <td
                                              align="left"
                                              valign="middle"
                                              style="word-break:break-word;border-collapse:collapse!important;vertical-align:top"
                                            >
                                              <a
                                                href="https://youtube.com/ioeri"
                                                title="YouTube"
                                                target="_blank"
                                                rel="noopener noreferrer nofollow"
                                              >
                                                <img
                                                  src="https://raw.githubusercontent.com/ioeridev/assets/public/mail/youtube.png"
                                                  alt="YouTube"
                                                  title="YouTube"
                                                  width="32"
                                                  style="outline:none;text-decoration:none;clear:both;display:block!important;border:none;height:auto;float:none;max-width:32px!important"
                                                  class="CToWUd"
                                                  data-bit="iit"
                                                >
                                              </a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <table
                                        align="left"
                                        border="0"
                                        cellspacing="0"
                                        cellpadding="0"
                                        width="32"
                                        height="32"
                                        style="width:32px!important;height:32px!important;display:inline-block;border-collapse:collapse;table-layout:fixed;border-spacing:0;vertical-align:top;margin-right:17px"
                                      >
                                        <tbody>
                                          <tr style="vertical-align:top">
                                            <td
                                              align="left"
                                              valign="middle"
                                              style="word-break:break-word;border-collapse:collapse!important;vertical-align:top"
                                            >
                                              <a
                                                href="https://twitter.com/ilkhoeri"
                                                title="Twitter"
                                                target="_blank"
                                                rel="noopener noreferrer nofollow"
                                              >
                                                <img
                                                  src="https://raw.githubusercontent.com/ioeridev/assets/public/mail/twitter.png"
                                                  alt="Twitter"
                                                  title="Twitter"
                                                  width="32"
                                                  style="outline:none;text-decoration:none;clear:both;display:block!important;border:none;height:auto;float:none;max-width:32px!important"
                                                  class="CToWUd"
                                                  data-bit="iit"
                                                >
                                              </a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <table
                                        align="left"
                                        border="0"
                                        cellspacing="0"
                                        cellpadding="0"
                                        width="32"
                                        height="32"
                                        style="width:32px!important;height:32px!important;display:inline-block;border-collapse:collapse;table-layout:fixed;border-spacing:0;vertical-align:top;margin-right:0px"
                                      >
                                        <tbody>
                                          <tr style="vertical-align:top">
                                            <td
                                              align="left"
                                              valign="middle"
                                              style="word-break:break-word;border-collapse:collapse!important;vertical-align:top"
                                            >
                                              <a
                                                href="https://github.com/ioeridev"
                                                title="GitHub"
                                                target="_blank"
                                                rel="noopener noreferrer nofollow"
                                              >
                                                <img
                                                  src="https://raw.githubusercontent.com/ioeridev/assets/public/mail/github.png"
                                                  alt="GitHub"
                                                  title="GitHub"
                                                  width="32"
                                                  style="outline:none;text-decoration:none;clear:both;display:block!important;border:none;height:auto;float:none;max-width:32px!important"
                                                  class="CToWUd"
                                                  data-bit="iit"
                                                >
                                              </a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="m_2725105697623234912u-row-container" style="padding:0px;background-color:transparent">
                <div
                  class="m_2725105697623234912u-row"
                  style="margin:0 auto;min-width:320px;max-width:600px;word-wrap:break-word;word-break:break-word;background-color:#f49104"
                >
                  <div style="border-collapse:collapse;display:table;width:100%;height:100%;background-color:transparent">
                    <div
                      class="m_2725105697623234912u-col m_2725105697623234912u-col-100"
                      style="max-width:320px;min-width:600px;display:table-cell;vertical-align:top"
                    >
                      <div style="height:100%;width:100%!important">
                        <div style="box-sizing:border-box;height:100%;padding:0px;border-top:0px solid transparent;border-left:0px solid transparent;border-right:0px solid transparent;border-bottom:0px solid transparent">
                          <table
                            style="font-family:'Cabin',sans-serif"
                            role="presentation"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                            border="0"
                          >
                            <tbody>
                              <tr>
                                <td
                                  class="m_2725105697623234912v-container-padding-padding"
                                  style="word-break:break-word;padding:10px;font-family:'Cabin',sans-serif"
                                  align="left"
                                >
                                  <div style="font-size:14px;color:#fafafa;line-height:180%;text-align:center;word-wrap:break-word">
                                    <p style="font-size:14px;line-height:180%">
                                      <span style="font-size:16px;line-height:28.8px">
                                        Copyrights © aoeri, Inc. All Rights Reserved
                                      </span>
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>`;
