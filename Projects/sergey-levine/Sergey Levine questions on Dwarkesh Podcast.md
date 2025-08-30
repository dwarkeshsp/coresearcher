### Continual learning

* **What will the solution to continual learning look like?**  
  * **Any Morevac’s Paradox type arguments for how hard it will be, and how long it will take?**  
* **Related: what learning paradigm are humans using? Is it RL? Have we even invented it yet? We can learn autonomously just by practicing/thinking about a task even when there is no explicit reward.**   
  * **Think about what’s happening to an employee as she’s upskilling in her first 6 months on the job. What exactly is the ML analogue for what’s happening here \- In context learning? System prompt updating? Something we haven’t invented yet?**   
  * If you had to come up with an ML analogy to sleep, what would it be?  
* I know you say continual learning is ultimately a RL problem. What exactly does that mean?   
  * Here’s a naive idea, curious if you think it would work: Inner loop, do SFT on session summaries. Outer loop, long horizon RL where it has to make use of skills and knowledge that have to pass between sessions. The reason I ask is that I’m curious whether you think something which clobbers together existing techniques like this will be enough, or whether we need a whole new paradigm.   
* What does the future with fleets of knowledge workers and robots learning from *each other’s* experiences look like?  
  * How quickly could this happen once continual learning/on-the-job training is solved? If copies of a single model are deployed through the economy and they can learn from each other's experience as quickly as humans can learn from their own experience, then it seems to me like you could have a broadly deployed intelligence explosion within a matter of months from a single AI learning how to do every single job in the world. That seems like a super-wild conclusion. Do you agree with this logic?   
* Once we do crack autonomous learning, then the speed of the robotics revolution will only be bottlenecked by how many robots you can deploy in diverse settings to learn in. Given that China is manufacturing all of these robots and already slotting them into factories and stores, what’s the story of how this robotics explosion happens in the US first?

### Meta learning

* In 2017, you published this really interesting paper, Model-Agnostic Meta Learning for Fast Adaption of Deep Networks. And the idea is very simple and elegant, just like next token prediction itself: basically train a model to take as few samples as possible to get fine tuned to a new task. You’re not training it on its direct performance at different tasks but the speed at which it can learn a new task, and the idea is that this rewards meta-learning.  
  * **I find it really interesting that the LLMs of today, which are the best general purpose meta learners we have, are not explicitly trained on any meta learning objective at all.** The meta learning just comes along for the ride as a side effect of next-token-prediction. **Why didn’t some method of directly incentivizing meta learning end up being scalable?** Did that surprise you? Do you expect that to change?   
* You have a very interesting blog post where you write that the reason LLMs have much more robust world models than video models is that LLMs can “simply copy some aspects of human mental representations without having to figure out the learning algorithm that allowed humans to acquire those representations in the first place.” And that “this means that we would expect LLM-like AI systems to be proficient in reproducing human-like cognitive skills, but relatively poor at actually acquiring new skills, representations, and abilities from experience in the real world.”  
  * How would you describe what about the training process for LLMs is preventing them from acquiring the flexibility and adaptability of human intelligence? What might the procedure for flexible learning look like?  
  * Isn’t this just the result of the fact that we haven’t scaled up compute for video models as much as LLMs (especially once you normalize for how much more “compute per token” you need in video)? LLMs initially had shitty representations too.  
  * **Given that your robotics models make extensive use of video and other data that doesn’t spell out representations as much as internet text, doesn’t that imply that these robotics models won’t be that robust either?**  
    * Or can we fix this problem by annotating robot data with language subtasks/chain of thought?  
  * Prima facie it seems surprising that one can learn really complex representations without having the learning process to acquire new representations. Maybe this explains why we have models winning IMO Gold while at the same time, no reasoning model has come up with a new math concept that seems even slightly interesting to a human mathematician.

## Robotics

### Data

* **The way one of your researchers described it to me, it’s like we have a GPT-2 moment for robotics, but instead of being able to immediately download a 100x bigger internet dataset and train GPT-3, you have to go collect it manually. What specifically is preventing you from 100xing your operations and data collection? Why don’t you?**  
* How much transfer learning do you see between modalities? If we can get transfer learning from different kinds of robots, why can’t we just train with humans on YouTube? Do you think making human workers GoPro record their work will actually be enough, or do you need robot state/actions as well?  
* So far it seems like you’re using supervised learning. Is RL going to be difficult to get working in robotics?  
* Are there hardware bottlenecks we need to solve first?  
  * The reason we might want to wait for better grippers is so that there’s better transfer for Meta glass recording data.  
* What does the data flywheel from deployment look like?

### Results

* What kinds of tasks do these models tend to fail at right now? Do they tend to have more to do with not understanding/being willing to do a certain task, or being bad at executing on it?  
* How does the ability of the robot to complete a task erode with task length? 

### Architecture

* Seems like we have a pareto frontier tradeoff between model size, inference speed, and context length. And even with relatively small models (low billions of parameters) which are only storing a second of context, you’re doing 100ms inference steps (by contrast the human brain processes 24 frames per second while coherently executing tasks for hours). So how do we expect to get many OOM improvements across all these dimensions at the same time?  
  * If you’re processing robot state, robot actions, language commands, and environment images continuously, which need to happen the fastest? And which can you delegate to a slower System 2 type loop?   
    * The outer brain seem to gather sense data at 10^9 bits/s, but the inner brain information throughput is only 10 bits/s  
  * What context length do we need before robots can really do everyday human tasks? Seems like they need at least minutes no? 2000 tokens seems too short.  
* Is the reason for optimism that we’ve made transformer/diffusion based models in other domains which are super smart and steerable, and therefore if we scaled up data for robotics, we’d get something equally as proficient?  
* **Google, Meta, etc have been trying to build some general purpose model for robotics based on transformers for 5 years. What dead end are they hitting** that you think you’ll avoid? What exactly has changed now?  
* What will the scaling laws for robotics look like?   
  * It’s interesting to me that while human brains are much bigger than monkey brains, this is mostly from neocortex expansion, and that the motor cortex/basal ganglia didn’t scale as fast. Does that suggest that a small distilled model will do just fine for movement, given that there apparently weren’t gains from scaling that evolution hill-climbed on?  
  * What are the scaling laws for the Gemma world model VLM backbone versus the action model? Which one is more important to scale up?  
* If you have really good vision language model, what is still missing?  
* Why no RL in Pi models?

### Future

* I want some concrete predictions. When will we have something that can fully automate what a line cook or barista can do?  
  * And what about including the long tail of tasks involved in doing those jobs (cleaning the machine, restocking, etc).  
  * The lesson from LLMs seems to be that even when you have models that can somewhat satisfactorily do certain subtasks (GPT-4), it’s still extremely hard to automate anywhere close to a full workflow. Will things be similar in robotics?   
  * Once we do get to GPT-4 level in robotics, how much longer to get to truly human level?  
* Given the advantages of batching, do you expect in the future that inference for robots will happen somewhat away from the machine?  
* **In 10 years, will the smartest models be able to do both knowledge work and robotics?** Be connected together somehow? If you’re betting on generalist models, does this seem like a reasonable prediction?  
* Generally, how will homes/factories/etc have to be reorganized to make use of cheap working robots?  
* **Why won’t robotics be like self-driving cars?** Google started that project in 2009, and for over a decade, we’ve had cool demos, but only now do we have a commercially viable and deployed machine.   
  * From my understanding, in self-driving cars, the perception is handled by DNNs, but the actual actions are determined by millions of lines of if statements. Will robotics tasks look like that?

