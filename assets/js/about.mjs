import {external,icons} from './ui.mjs';

export function aboutPage(config){
 return `<div class="container about-page">
  <div class="breadcrumbs about-breadcrumbs"><a href="#/">Home</a><span>/</span><span>About BluePeak</span></div>
  <section class="about-hero" aria-labelledby="about-title">
   <div class="about-intro"><span class="eyebrow">The story behind BluePeak</span>
    <h1 id="about-title">Every great server<br>starts with <span>a vision.</span></h1>
    <p class="about-lead">A world with its own identity. Experiences worth coming back for. A community that makes it all matter.</p>
    <p>BluePeak Development creates premium FiveM resources for the people bringing those worlds to life. Our part is to help you turn the next idea for your server into something your players can experience.</p>
    <div class="action-group"><a class="button" href="#/resources">Explore our resources ${icons.arrow}</a>${external(config.discordUrl,'Meet the community','button secondary')}</div>
   </div>
   <div class="about-art"><img src="assets/brand/bluepeak-logo.png" alt="BluePeak Development — Premium FiveM Resources" width="1254" height="1254" fetchpriority="high"><div class="about-art-caption"><span class="status-dot"></span>YOUR WORLD. YOUR NEXT CHAPTER.</div></div>
  </section>
  <section class="about-story" aria-labelledby="about-story-title">
   <div><span class="eyebrow">More than another resource</span><h2 id="about-story-title">You build the world.<br><span>We help shape the details.</span></h2></div>
   <div class="about-story-copy"><p>A FiveM server is more than a collection of files. It is the first impression when someone joins, the systems they use every day, and the small details that make your community feel like somewhere of its own.</p><p>That is the thinking behind BluePeak. We bring design and practical functionality together, with attention to how a resource looks, how it works, and where it fits into the world you are building.</p><p>Whether you are taking your first steps or refining an established server, the goal stays the same: give your next addition a clear purpose, and make it feel at home.</p></div>
  </section>
  <section class="about-standards" aria-labelledby="about-standards-title">
   <div class="about-section-head"><span class="eyebrow">The BluePeak approach</span><h2 id="about-standards-title">Purpose in every detail.</h2><p>Three principles guide what we aim to bring to your server.</p></div>
   <div class="about-principles">
    <article class="about-principle"><div class="about-card-top"><span class="value-icon">${icons.diamond}</span><span class="about-number">01</span></div><h3>Identity you can feel.</h3><p>Your server should feel like your server. We care about cohesive interfaces, considered visuals, and the details that give an experience its character.</p></article>
    <article class="about-principle"><div class="about-card-top"><span class="value-icon">${icons.bolt}</span><span class="about-number">02</span></div><h3>Function with a purpose.</h3><p>A good-looking resource should earn its place. Our focus is useful functionality and thoughtful implementation, with each release explaining its features and requirements.</p></article>
    <article class="about-principle"><div class="about-card-top"><span class="value-icon">${icons.chat}</span><span class="about-number">03</span></div><h3>A conversation that continues.</h3><p>Questions are part of building. Our Discord is the preferred place to ask about a resource, discuss compatibility, and find the right next step with BluePeak.</p></article>
   </div>
  </section>
  <section class="about-journey" aria-labelledby="about-journey-title">
   <div class="about-section-head"><span class="eyebrow">From inspiration to your server</span><h2 id="about-journey-title">Make your next upgrade count.</h2></div>
   <ol class="about-steps">
    <li><span class="about-step-number">01</span><div><h3>Find your fit.</h3><p>Explore the collection, see each resource in detail, and check its supported framework and dependencies before choosing.</p></div></li>
    <li><span class="about-step-number">02</span><div><h3>Choose with clarity.</h3><p>Review the product information and ask us if you need more detail. When you are ready, payments and order fulfillment are handled through Tebex.</p></div></li>
    <li><span class="about-step-number">03</span><div><h3>Make it part of your world.</h3><p>Follow the resource’s setup guidance, check it against your server’s integrations, and reach out through Discord when you need help.</p></div></li>
   </ol>
   ${external(config.docsUrl,'Explore the documentation','text-link about-docs')}
  </section>
  <section class="about-community" aria-labelledby="about-community-title"><span class="eyebrow">The next chapter is yours</span><h2 id="about-community-title">Build something<br>your community remembers.</h2><p>Bring the vision. Explore what BluePeak can add to it.<br>And if you have a question before your next upgrade, start a conversation.</p><div class="action-group">${external(config.discordUrl,'Join our Discord')}<a class="button secondary" href="#/resources">Discover the collection ${icons.arrow}</a></div><a class="about-support-link" href="#/support">Prefer email? Find all support options ${icons.arrow}</a></section>
 </div>`;
}
