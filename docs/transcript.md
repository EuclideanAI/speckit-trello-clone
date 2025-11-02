The first step with the spec kit is to use the magic command: `/specify.constitution`. This tells the coding agent to generate a Constitution document. By "Constitution," we mean a high-level requirement for code quality, testing standards, and keeping the user experience consistent. These are just broad  requirements—we don't need to get into too much detail yet.

Because it's open source, speckit supports most mainstream coding agent that's available, whether it's through your IDE or CLI. I picked Claude Sonnet 4.5 with my github Copilot. AI agen will read the constitution template and update it accordingly. 

And now let's have a look at the Constitution document once it's finished.  If you go to the `.specify` folder, and then open the `memory` subfolder, you'll see the updated Constitution document.

Let's review what it says. The first section covers code quality standards, stating that code must maintain professional standards to ensure maintainability and readability. There are some high-level requirements, such as consistency, functions and components having single clear responsibilities, and eliminating code duplication. Type safety is emphasized, which is important for TypeScript.

The document also outlines testing standards, requiring the coding agent to use test-driven development—meaning it writes test code before the actual implementation. It mandates unit tests, integration tests.

Once we are happy with the Constitution, let's move on to produce the actual specification. To do this, we use another slash command: `/speckit.specify`. Here, we provide more specific requirements and describe the product we want to build.

Let's say we want to build a lightweight project management tool inspired by Trello. The tool should have a UI with tasks displayed as draggable cards. Users should be able to add, modify, and remove tasks. The cards can be dragged across different columns, which represent different stages of the project.

 After a few minutes, the coding agent saves the specification in the `specs` folder as `spec.md`, updated based on our prompt.

Inside this file, you'll see our original input, followed by generated user scenarios and testing requirements. The document lists functional requirements, assumptions, key entities, and measurable outcomes as success criteria. This results in a detailed specification for our MVP.

Up to this point, we haven't specified anything technical. The next step is to define the technical requirements. To do this, we use another slash command: `/speckit.plan`, where we provide our technical and architectural requirements.

For example, we want the project to use Next.js 15—since nextjs16 is less stable and the coding agent may not have enough training data for it yet. The app should be full stack, using Next.js App Router and API routes.

For the MVP, we assume there is no authentication or authorization, so we focus on the core functional features and user interactions.

We also instruct the coding agent to use SQLite for local development, Prisma as the ORM, Tailwind CSS for styling, Shadcn UI as the UI components library, and Lucide React for icons. The coding agent takes these requirements and generates a `plan.md` file under the same folder as the spec. This plan file serves as a more technical specification, outlining the architectural and solution details, including the folder structure and tech stack. The AI agent uses this plan to generate detailed implementation tasks.

Now let's move on to task generation. For this, we use the command: `/speckit.tasks`. You don't need to provide much prompt this time just run the command.

The coding agent will read through the `plan.md` and generate a new file under the specs folder called `tasks.md`. This file will outline the implementation phases, purposes, and a detailed list of tasks with checkboxes.

To recap, we've used four main commands so far: Constitution (to set up the high-level quality standards), Specify (to generate the specification), Plan (to create the solution document tied to the spec), Tasks (to generate the detailed task list). Before we run the last command, let's make an initial git commit to save all documentation. 

After this, we move on to the most exciting part—getting the project built by running the last speckit command `/speckit.implement`. When you run the implementation command, the coding agent will strictly follow the `tasks.md` file and begin implementing the project. It will start by setting up the Next.js 15 project, then quickly work through the task list— once, it's completed with phase1, we can run it with `npm run dev` locally and we can see it has got a nextjs app running.

If you enjoy the content we share on YouTube, please give us a like and hit the subscribe button. You can also visit our Euclidean AI website for more detailed content. You'll find the latest videos, blog posts, and courses—many of these resources are free including online courses and GitHub repositories to help you get hands-on experience and follow step-by-step tutorials. 

If you have question, best way is to join our Discord channel with the invitation link below to interact with the community.

The next task is to create the task cards in the columns that represent different stages of the project. The coding agent was able to complete this step, but the cards aren't draggable yet. The following step is to make them draggable. The agent followed the task list closely—when it encountered a few bugs, I simply copied and pasted the error messages from the browser back to the agent, and it was able to fix them without me needing to write any code or intervene directly.

The next step is to finish the function for creating a task, which involves making API calls to store tasks in our local SQLite database. After that, I polished the UI by adding a Lake Wanaka background image to the Trello clone application, which turned out quite nicely.

At this point, the project is almost complete—it took about an hour to build a Trello clone with speckit that has proper documentation, specifications, solution design, and detailed task plans. There were some bugs along the way, but the AI agent was able to fix them with a bit of help from me copying error messages.

Overall, it was a good experience. Some documents could be more concise in my opinions to reduce token consumption, but the outputs are very useful. The final documents include a clear API contract, a data model and schema for Prisma, API endpoints under the Next.js App Router, and a SQLite file with all the tables for data storage.














