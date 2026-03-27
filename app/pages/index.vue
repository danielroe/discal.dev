<template>
  <div>
    <h1>discal.dev</h1>
    <p>Subscribe to Discord server events via ICS calendar feeds.</p>

    <section>
      <h2>How it works</h2>
      <ol>
        <li>Add the discal bot to your Discord server</li>
        <li>Sign in and configure your timezone and calendar settings</li>
        <li>Share the calendar URL &mdash; anyone can subscribe in Google Calendar, Apple Calendar, Outlook, etc.</li>
        <li>Optionally connect your AT Protocol account to publish events to the atmosphere</li>
      </ol>
    </section>

    <section>
      <h2>Features</h2>
      <ul>
        <li>Subscribable ICS calendar feed that auto-updates</li>
        <li>Recurring events with proper timezone and DST handling</li>
        <li>AT Protocol integration &mdash; publish events as <code>community.lexicon.calendar.event</code> records</li>
        <li>RSVP via AT Protocol &mdash; your attendance is stored in your own data repo</li>
      </ul>
    </section>

    <section>
      <h2>Get started</h2>
      <p>
        <a href="/auth/discord">Sign in with Discord</a>
        to add your server and get a calendar feed.
      </p>
    </section>
  </div>
</template>
