## Preface

Nobody reads prefaces, they just want the facts. So I'd give you the tl;dr;

> I went to a meditation retreat, and realized I was coding InfraGen (Infrastructure Generator) all wrong. I was ignoring software development practices (such as small PRs, KISS, planning first), which ironically InfraGen was built to enforce. I just wanted to get something out to show the world. Upon meditating, I decided to build InfraGen the right way, and document the process.

And for the few of you who are interested in the backstory, and some interesting psych analysis, here's the full story:

When I first got the idea for InfraGen I was obsessed. For a few days it was all I could think about. Every bit of free time I had I spent coding InfraGen. I didn't even give my girlfriend, Asya, a proper good bye the day she went to Africa because my mind was completely immersed in this project. We've all been there!

I had a long vacation coming up myself. A few days late, I was off to a 4 day meditation retreat at MAPLE (a Buddhist monastery), later meeting with my roommates and girlfriend in Tanzania. Up until I reached MAPLE, I had coded for at least 24 consecutive hours.

I had planned my MAPLE trip 5 months in advanced and it couldn’t have possibly come at a better time. By the time I arrived I was hours into debugging some refractors I made to the codebase. Luckily I wrote pretty thorough tests. But it became a painstaking process of trying fixes, crossing my fingers "this is the last fix before I see all green" and of course being disappointed by yet another error. Finally I put down my laptop, committing to being coding-free the entire retreat.

The first few days of the meditation retreat did not go well. We had a regimented schedule waking up at 4:30 AM, doing 1.5h of meditation, followed by half an hour of chanting, cleaning, and breakfast, all in silence. And at night, same thing, 1.5h of sitting, half an hour of chanting, and then silence.

I was not fitting in. Everyone seemed experienced in mediation, they must have been doing it for many years. And I sorely stuck out. I fidgeted and groaned through the mediation. The leader constantly reminded me to sit properly, be mindful of those around me, not make noise. I was sleeping at the breakfast table, dragging my body around trying to keep awake.

Even though I was constantly corrected, I felt very supported. The leader gave me a lesson on proper posture. My mentor patiently talked through possible solutions with me and said that he believed in me, and to try it one more time. So the last night of the retreat, I tried my best to not take the corrections personally or blame myself for being bad at meditation and a nuisance to others. After all the center of Buddhist philosophy is equanimity. That is not letting other people or events affect how you feel. Just do your best. If things don’t go they way you want, don't blame yourself, stay unattached to the outcome. You did what you could at the time. No more no less.

Then I had an idea. I was prescribed Ritalin and Dextroamphetamine my psychiatrist for ADHD. Even though I generally have a positive outlook on pharmaceuticals, I was still resisting due to cultural stigma. I generally just took it at work, and even that occasionally. I hesitated using it "this is cheating", "I want to do it on my own". But that night I realized taking prescribed medication, with the guidance of a trained psychiatrist, is just a way of trusting and accepting help. I had to accept that my psychiatrist knows what she is doing and will make adjustment if and when needed. So I popped two pills.

I don't know if it was my mentor trusting me, or the meds, or both. But after about half an hour, all my usual back pains disappeared. My mind was focused and clear. And somehow it went to the topic of InfraGen. At first I resisted, thinking "no my mind has to be clear" "don't think about work". But then I remembered, one of the best strategies is to observe your thoughts patiently, let them play out.

The next hour flew by. Almost as if it was coming from something outside of me - I started understanding why InfraGen wasn't coming along as I'd hoped.

I realized that I was hypocritical in my development approach. I knew the proper things to do and not do, yet I let my excitement and need for instant gratification take over. It felt as if I was wasting time by following best practices. All I wanted to do was get a working MVP out, impress my boss, impress my colleagues, impress the Open Source community. But that’s not what software development is about. I wasn’t serving anyone by this kind of approach, except falsely feeding my ego.

Through my meditation, I realized that this is an opportunity to write a guide on proper software development. All the lessons I learned over the last 10 years, actually applied on a real project I was developing.

I decided I would not take shortcuts to “just get it done”. I would start from scratch, apply the best practices I learned, and build InfraGen properly, and in parallel document what I was doing into this guide.

This guide is not only the documentation of InfraGen, but a story of how it was built, and lessons I learned along the way, with practical examples of how I applied them.
