# ot-session-monitoring-test-case
MCVE Test case showcasing that [Session Monitoring][session-monitoring] events
sent by Tokbox add-up to innacurate call minutes.

This test case concerns the nicholas@bitpaper.io account,
with Project ID: 46186162.

## Overview

We use Session Monitoring events to monitor call usage within our app.

We noticed that on several occasions, where we are absolutely certain that
we received all events correctly, the call minutes **DO NOT** line up with
what the [Insights Dashboard][insights-dashboard] states for a given day.

To illustrate this we:

- Chose a sample date: **March 6, 2020 00:00.000Z** to **March 6, 2020 23:59.999Z**.
- Downloaded all events for this date in a [JSON textfile][mar-6-events-json],
  located in this repo.
- Replay those events to get the streams and their total publish durations.
- Get the sum of duration of all streams.
- Check if they align with what the [Insights Dashboard][insights-dashboard]
  states is the published minutes usage for **March 6**.

They do not align. We calculate **46951 minutes** while the
[Insights Dashboard][insights-dashboard] states that we used **43564 minutes**.

![Insights Dashboard Screenshot showing 43564 minutes for March 6](https://github.com/nicholaswmin/ot-session-monitoring-test-case/blob/master/insights-dash-screenshot.png?raw=true)

## Run

Install [NodeJS][node], clone this repo, then:  

```bash
$ node index.js
# The process will load the events JSON,
# iterate over all events for Mar. 6 and:
# - Recreate the streams.
# - End them.
# - Calculate the sum of total duration in minutes.
# - Log the result.
```

## How we calculate minutes

When a `streamCreated` event comes through:
 - Check if a *saved Stream* exists with that particular `stream.id`.
   - If not, create a new `Stream` with the stream properties declared in the
     event and save it in *saved Streams*.
   - If yes, do nothing.

When a `streamDestroyed` event comes through:
  - Check if *saved Stream* exists with that particular `stream.id`.
    - If not, do nothing.
    - If yes, subtract the `stream.createdAt` timestamp from the
      `event.timestamp` and save the result as the `stream.duration`.

When done, get all *saved Streams* and sum their `stream.duration`.

This exact logic is followed in code, found in `./index.js` with code comments.

## Assumptions made

### We have all Session Monitoring events for March 6

We are as certain as possible we have all events based on these facts:

- We have no errors in our logs.
- Session Monitoring was not suspended.
- Even if there are missing events, this would result in *less* minutes
  calculated than what is stated in the Insights Dashboard.
  Based on our logic above, the result is that
  we have *more* minutes calculated.

### Both the dashboard and event timestamps are in UTC.

From Tokbox support ticket: #1319827:

> Hi Nik,
> Thanks for reaching out.
> The display usage Timezone is based on UTC.
> All of the dates and times provided in TokBox platform logs
> and callbacks are in Coordinated Universal time (UTC).

### Insights Dashboard sums up all minutes for all streams published within that date

As your support person stated in the same support ticket, Insights Dashboard
sums up all minutes for all published and also any *in progress* which might
have started the previous day, or ended the next (i.e they are in-progress and
overlap the selected date).

We didn't implement *overlapping & in progress* stream minutes calculations
here.
Even if we did, we would get *more* minutes which would make the result even
more wrong.

## Authors

[@nicholaswmin][nicholaswmin] - Nicholas Kyriakides, Lead Eng. @ Bitpaper.

[node]: https://nodejs.org/en/
[session-monitoring]: https://tokbox.com/developer/guides/session-monitoring/
[insights-dashboard]: https://tokbox.com/account/#/project/46186162
[mar-6-events-json]: https://github.com/nicholaswmin/ot-session-monitoring-test-case/blob/master/sample-events/2020-03-06T00:00:00.000Z-to-2020-03-06T23:59:59.999Z.json
[nicholaswmin]: https://github.com/TheProfs/nicholaswmin
