import {escapeHTML as e} from './core.mjs';
import {external,icons} from './ui.mjs';

const groups=[
 {id:'buying',name:'Choosing & buying',icon:'bag',intro:'Find the right resource and know what to expect at checkout.',items:[
  ['How do I purchase a resource?', '<p>Browse the <a href="#/resources">collection</a>, open a resource, and review its features, requirements, and purchasing options. Add it to your basket, connect your FiveM / Cfx.re account if required, then select <strong>Open Tebex checkout</strong> to complete your order securely.</p>'],
  ['How do I know if a resource works with my server?', '<p>Check the individual listing for its supported framework, dependencies, server requirements, and any compatibility notes. Support for one framework does not imply support for another.</p><p>If your server uses custom integrations or you are unsure about a requirement, <a href="#/support">ask us before purchasing</a> and tell us what you run.</p>'],
  ['Can I view prices in my currency?', '<p>Use the currency selector at the top of the site. USD is the default; other displayed currencies are conversion estimates. Tebex confirms the available payment currencies, taxes, and final amount during checkout.</p>'],
  ['Where do I enter a discount or gift card code?', '<p>Open Tebex checkout from your basket. If Tebex offers a field for your code, enter it there and check that the final total has changed before paying. Eligibility and accepted code types are determined by Tebex and the store’s settings.</p>']
 ]},
 {id:'installation',name:'Delivery & installation',icon:'bolt',intro:'From your order confirmation to the first run on your server.',items:[
  ['Where do I find my resource and receipt?', '<p>Check the email address used at checkout for your Tebex receipt, including spam or junk folders. Follow the delivery instructions in that receipt and the product listing.</p><p>For a resource delivered through Cfx.re, use the Cfx.re account associated with the purchase and follow the applicable asset-access instructions. Delivery can differ between products.</p>'],
  ['What should I do before installing or updating?', '<p>Read the resource’s setup guidance and check its dependencies first. Back up your server files and any affected database, then test the installation in a development environment before applying it to your live server.</p><p>Keep resource folder names and required files as specified in the documentation.</p>'],
  ['Can I customize a resource?', '<p>You may customize editable files within the permissions of the product and its license. Available configuration options, editable interfaces, and any protected files vary by release; check the listing and documentation.</p><p>Customization does not grant permission to redistribute the resource. See our <a href="#/terms">Terms of Service</a> for the license conditions.</p>'],
  ['Something is not working. What should I send support?', '<p>Include the resource name, your framework and relevant versions, the steps that reproduce the issue, and any relevant console errors. Tell us about recent changes or custom integrations, and include your Tebex transaction reference when purchase verification is needed.</p><p>Remove passwords, license keys, payment details, and unrelated personal information from screenshots and logs before sharing.</p>']
 ]},
 {id:'account',name:'Account & checkout',icon:'shield',intro:'Understand sign-in, payment confirmation, and order access.',items:[
  ['Why do I need to connect my FiveM / Cfx.re account?', '<p>When required by the store, Tebex uses your connected identity for purchase eligibility and fulfillment. Sign-in follows the official provider’s page in the same tab, then returns you to the storefront.</p><p>BluePeak does not ask for or collect your Cfx.re password. Make sure you connect the account you intend to use for the purchase.</p>'],
  ['I returned from checkout. Is my payment confirmed?', '<p>The thank-you page acknowledges your return to the store; it is not proof that a payment succeeded. Check your Tebex receipt and the payment status before assuming an order is complete.</p><p>If the status is unclear, use the support details in your Tebex receipt or <a href="#/support">contact support</a> with your transaction reference.</p>'],
  ['My payment is pending or my order has not arrived. What now?', '<p>Check your Tebex receipt and payment status, confirm you are using the correct account, and review the product’s delivery instructions. Avoid placing a second order until you understand the status of the first.</p><p>For payment or billing questions, use Tebex’s checkout support. For resource-access questions, contact BluePeak with the resource name and transaction reference.</p>'],
  ['Who processes my payment?', '<p>Tebex is the merchant of record and handles checkout, payment processing, and the configured order-fulfillment process. Review the final price, purchase options, and terms shown there before confirming your order.</p><p>Never send card details or account passwords through BluePeak support.</p>']
 ]},
 {id:'support',name:'Support & licensing',icon:'chat',intro:'Know where to get help and how to use your purchase responsibly.',items:[
  ['What is the best way to contact BluePeak?', '<p><strong>Discord is our preferred support channel.</strong> Use the support options below to join the community. Email is available if Discord is not suitable for you.</p><p>Provide a clear summary of your question and the resource name so we can understand what you need. Response times vary; no fixed turnaround is promised.</p>'],
  ['Can I get a refund?', '<p>Read our <a href="#/refunds">Refund Policy</a> and the terms presented by Tebex at checkout. For an order issue, provide your transaction reference and explain the problem through the available support channels. Applicable consumer rights remain protected.</p>'],
  ['Can I share, resell, or leak a purchased resource?', '<p>No. Purchasing a resource does not authorize leaking, reselling, publishing, or distributing its files to unlicensed users, including modified copies.</p><p>Once a violation is reasonably established, leaking or unauthorized redistribution results in a <strong>permanent ban from future BluePeak Development purchases</strong>. Review the <a href="#/terms">Terms of Service</a> for the full license, enforcement, and appeal provisions.</p>'],
  ['Are updates, custom work, or unlimited support included?', '<p>Only the entitlements expressly stated in the product listing or agreed in writing are included. Do not assume a purchase includes future updates, custom development, or unlimited support.</p><p>If you need a specific integration or service, ask about it before purchasing.</p>']
 ]}
];

export function faqPage(config){return `<div class="container faq-page">
 <div class="breadcrumbs faq-breadcrumbs"><a href="#/">Home</a><span>/</span><span>Help & answers</span></div>
 <section class="faq-hero" aria-labelledby="faq-title"><div><span class="eyebrow">The BluePeak help desk</span><h1 id="faq-title">A little clarity.<br><span>A confident next step.</span></h1><p>From choosing your first resource to getting it running, find the details that help you move forward.</p></div><aside class="faq-help-card"><span class="value-icon">${icons.chat}</span><h2>A question worth asking?</h2><p>If you cannot find your answer here, start a conversation. Discord is our preferred place to help.</p>${external(config.discordUrl,'Ask us on Discord','text-link')}</aside></section>
 <div class="faq-tools"><div class="faq-search-wrap">${icons.grid}<label class="sr-only" for="faq-search">Search questions and answers</label><input type="search" id="faq-search" placeholder="Search answers, e.g. installation or payment" autocomplete="off" aria-controls="faq-results"></div><div class="faq-topics" role="group" aria-label="Filter questions by topic"><button data-faq-topic="all" aria-pressed="true">All questions</button>${groups.map(g=>`<button data-faq-topic="${g.id}" aria-pressed="false">${e(g.name)}</button>`).join('')}</div></div>
 <p class="faq-result-count" id="faq-result-count" role="status" aria-live="polite">16 answers to help you get started</p>
 <div id="faq-results">${groups.map((g,i)=>`<section class="faq-group" data-faq-group="${g.id}" aria-labelledby="faq-group-${g.id}"><div class="faq-group-intro"><span class="faq-group-number">0${i+1}</span><h2 id="faq-group-${g.id}">${e(g.name)}</h2><p>${e(g.intro)}</p></div><div class="faq-questions">${g.items.map(([q,a],j)=>`<details class="faq-question" ${i===0&&j===0?'open':''}><summary>${e(q)}<span class="faq-toggle" aria-hidden="true"></span></summary><div class="faq-answer">${a}</div></details>`).join('')}</div></section>`).join('')}</div>
 <div class="faq-no-results" hidden><span class="value-icon">${icons.chat}</span><h2>Let’s find another way.</h2><p>No answers match that search. Try fewer words, choose another topic, or ask us directly.</p><button class="button secondary" data-faq-reset>Show all questions</button></div>
 <section class="faq-contact"><div><span class="eyebrow">People behind the resources</span><h2>Still need a hand?</h2><p>Tell us which resource you are using and what you need help with.<br>For an existing order, have your Tebex transaction reference ready.</p></div><div class="faq-contact-actions">${external(config.discordUrl,'Join our Discord','button')}<a class="text-link" href="#/support">Email & other support options ${icons.arrow}</a></div></section>
 <div class="faq-policy-links"><span>Useful details</span><a href="#/terms">Terms of Service</a><a href="#/refunds">Refund Policy</a><a href="#/privacy">Privacy Policy</a>${external(config.docsUrl,'Documentation','text-link')}</div>
 </div>`}

export function filterFAQ(root){
 const query=root.querySelector('#faq-search').value.trim().toLowerCase();
 const topic=root.querySelector('[data-faq-topic][aria-pressed="true"]')?.dataset.faqTopic||'all';
 let count=0;
 for(const group of root.querySelectorAll('[data-faq-group]')){
  let visible=0;
  for(const item of group.querySelectorAll('.faq-question')){
   const match=(topic==='all'||topic===group.dataset.faqGroup)&&query.split(/\s+/).every(word=>item.textContent.toLowerCase().includes(word));
   item.hidden=!match;
   if(match){visible++;count++;if(query)item.open=true}
  }
  group.hidden=visible===0;
 }
 root.querySelector('.faq-no-results').hidden=count!==0;
 root.querySelector('#faq-result-count').textContent=count+' answer'+(count===1?'':'s')+(query?' matching your search':topic==='all'?' to help you get started':' in this topic');
}
