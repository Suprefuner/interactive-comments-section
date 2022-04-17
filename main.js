const container = document.querySelector(".container")
let commentIndex = null
let replyIndex = null
let idCounter = 0

const controlComment = async function () {
  try {
    //geting data --------------------------------------------------

    let data = await fetch("./data.json").then((res) => res.json())

    const initData = function () {
      const storage = localStorage.getItem("comments")
      if (storage) data = JSON.parse(storage)
    }

    initData()

    console.log(`new data:`)
    console.log(data)

    let curUser = data.currentUser
    let comments = data.comments
    let delTarget = ""

    curUser = {
      username: curUser.username,
      image: curUser.image,
    }

    //Render UI --------------------------------------------------

    const renderComments = function (data = comments) {
      const markup = data
        .map(
          (comment) =>
            `
            <div class="feed comment" id="${comment.id}">
            <div class="feed__score--control">
              <div class="score--control">
                <img src="./images/icon-plus.svg" alt="plus" class="score--plus" />
                <span class="feed__score txt--bold txt--blue">${
                  comment.score
                }</span>
                <img
                  src="./images/icon-minus.svg"
                  alt="minus"
                  class="score--minus"
                />
              </div>
            </div>
            <div class="feed__body">
              <div class="feed__info__header">
                <div class="feed__info">
                  <img
                    src=${comment.user.image.png}
                    class="user__profile-pic"
                    alt="user's profile picture"
                  />
                  <span class="user-name txt--bold">${
                    comment.user.username
                  }</span>
                  ${
                    comment.user.username === curUser.username
                      ? `<span class="my-reply-tag">you</span>`
                      : ""
                  }
                  <span class="created-at text">${comment.createdAt}</span>
                </div>
                <div class="btn btn--group">
                  ${
                    comment.user.username === curUser.username
                      ? `
                        <button class="btn btn--del">
                          <img src="./images/icon-delete.svg" alt="delete button" />
                          <span class="btn-txt txt--bold txt--red">Delete</span>
                        </button>
                        <button class="btn btn--edit">
                          <img src="./images/icon-edit.svg" alt="edit button" />
                          <span class="btn-txt txt--bold txt--blue">Edit</span>
                        </button>
                      `
                      : `
                      <button class="btn btn--reply">
                        <img src="./images/icon-reply.svg" alt="reply button" />
                        <span class="btn-txt txt--bold txt--blue">Reply</span>
                      </button>
                    `
                  }
                </div>
              </div>
              <p class="feed__content">
                ${comment.content}
              </p>
            </div>
          </div>
          
          <!--如果有reply的話就render-->

          <ul class="feed__replies ${
            comment.replies.length === 0 ? "hidden" : ""
          }">` +
            replyMarkup(comment.replies) +
            `
          </ul>
        `
        )
        .join("")
      container.insertAdjacentHTML("afterbegin", markup)
    }

    const replyMarkup = function (data) {
      return `
      ${
        data.length === 0
          ? ""
          : data
              .map(
                (reply) => `
              <li class="feed reply" id="${reply.id}">
                <div class="feed__score--control">
                  <div class="score--control">
                    <img
                      src="./images/icon-plus.svg"
                      alt="plus"
                      class="score--plus"
                    />
                    <span class="feed__score txt--bold txt--blue">${
                      reply.score
                    }</span>
                    <img
                      src="./images/icon-minus.svg"
                      alt="minus"
                      class="score--minus"
                    />
                  </div>
                </div>
                <div class="feed__body">
                  <div class="feed__info__header">
                    <div class="feed__info">
                      <img
                        src=${reply.user.image.webp}
                        class="user__profile-pic"
                        alt="user's profile picture"
                      />
                      <span class="user-name txt--bold">${
                        reply.user.username
                      }</span>
                      ${
                        reply.user.username === curUser.username
                          ? `<span class="my-reply-tag">you</span>`
                          : ""
                      }
                      <span class="created-at text">${reply.createdAt}</span>
                    </div>
                    <div class="btn btn--group">
                    ${
                      reply.user.username === curUser.username
                        ? `
                        <button class="btn btn--del">
                          <img src="./images/icon-delete.svg" alt="delete button" />
                          <span class="btn-txt txt--bold txt--red">Delete</span>
                        </button>
                        <button class="btn btn--edit">
                          <img src="./images/icon-edit.svg" alt="edit button" />
                          <span class="btn-txt txt--bold txt--blue">Edit</span>
                        </button>
                      `
                        : `
                      <button class="btn btn--reply">
                        <img src="./images/icon-reply.svg" alt="reply button" />
                        <span class="btn-txt txt--bold txt--blue">Reply</span>
                      </button>
                    `
                    }
                    </div>
                  </div>
                  <p class="feed__content">
                  <span class="replying-to">@${reply.replyingTo}</span>
                    ${reply.content}
                  </p>
                </div>
              </li>`
              )
              .join("")
      }
      `
    }

    const textAreaMarkup = function (type = "regu") {
      return `
        <div class="feed comment-area comment-area--${type}">
          <img
            src=${curUser.image.webp}
            class="user__profile-pic"
            alt="Current user's profile picture"
          />
          <textarea
            name="comment"
            id="input__txt-area"
            cols="30"
            rows="5"
            class="input__txt-area"
            placeholder="Add a comment..."
          >${
            type === "regu" ? "" : "@" + comment.user.username + ", "
          }</textarea>
          <button class="btn--regu btn--send">
            <span class="btn-txt txt--bold">${
              type === "regu" ? "send" : "reply"
            }</span>
          </button>
        </div>
      `
    }

    const renderInputComment = function () {
      container.insertAdjacentHTML("beforeend", textAreaMarkup())
    }

    const clear = function () {
      //Becoz of the HTML structure I have to do it like this, I will fix it after first attempt!!!
      container.innerHTML = `
        <div class="overlay hidden"></div>
        <div class="del-comment-window hidden">
          <h3 class="title">Delete comment</h3>
          <p class="del-comment__content">
            Are you sure you want to delet this comment? This will remove the
            comment and can't be undone.
          </p>
          <div class="btn-wrapper">
            <button class="btn--regu btn--cancel">no, cancel</button>
            <button class="btn--regu btn--del-big">yes, delete</button>
          </div>
        </div>
      `
    }

    const render = function () {
      renderComments()
      renderInputComment()
    }

    render()

    idCounter = document.querySelectorAll(".feed").length - 1

    //Function ----------------------------------------------------
    // 因為UI都係render出黎以為要係container度addEventListener
    // 最後都係用返呢個方法, 因為可以一次過套用晒btn=e.target同埋可以套用晒

    container.addEventListener("click", function (e) {
      const btn = e.target

      //controlling the score
      if (
        btn.classList.contains("score--plus") ||
        btn.classList.contains("score--minus")
      )
        scoreControl(btn)

      //reply button function
      if (btn.closest(".btn--reply")) renderReplyBox(btn)

      //delete / cancel button function
      if (btn.closest(".btn--cancel")) renderDelModal()

      if (btn.closest(".btn--del")) {
        delTarget = btn.closest(".feed")
        renderDelModal()
      }

      //delete my comment/reply
      if (btn.classList.contains("btn--del-big")) {
        delMyComment(delTarget)
      }

      //submit reply or comment
      if (btn.closest(".btn--send")) reply(btn)

      //edit button function
      if (btn.closest(".btn--edit")) editMyComment(btn)

      //update button function
      if (btn.closest(".btn--update")) updateMyComment(btn)
    })

    const editMyComment = function (target) {
      if (document.querySelector(".btn--update")) return

      target = target.closest(".feed")
      const id = +target.getAttribute("id")
      findTargetIndex(id)
      let comment = ""
      if (commentIndex !== null && replyIndex !== null)
        comment = comments[commentIndex].replies[replyIndex]

      if (commentIndex !== null && replyIndex === null)
        comment = comments[commentIndex]

      const content = target.querySelector(".feed__content")
      const markup = `
          <textarea
            name="comment"
            id="input__txt-area"
            cols="30"
            rows="5"
            class="input__txt-area edit__content"
            placeholder="Add a comment..."
          >${comment.content}</textarea
          >
          <div class="btn-update-wrap">
            <button class="btn--regu btn--update">
              <span class="btn-txt txt--bold">update</span>
            </button>
          </div>
        `
      content.insertAdjacentHTML("beforebegin", markup)
      content.remove()
      // target.innerHTML = `
      //         <div class="feed__score--control">
      //           <div class="score--control">
      //             <img src="./images/icon-plus.svg" alt="plus" class="score--plus" />
      //             <span class="feed__score txt--bold txt--blue"
      //               >${comment.score}</span
      //             >
      //             <img
      //               src="./images/icon-minus.svg"
      //               alt="minus"
      //               class="score--minus"
      //             />
      //           </div>
      //         </div>
      //         <div class="feed__body">
      //           <div class="feed__info__header">
      //             <div class="feed__info">
      //               <img
      //                 src="${curUser.image.png}"
      //                 class="user__profile-pic"
      //                 alt="user's profile picture"
      //               />
      //               <span class="user-name txt--bold"
      //                 >${curUser.username}</span
      //               ><span
      //                 class="my-reply-tag"
      //                 >you</span
      //               >
      //               <span class="created-at text">${comment.createdAt}</span>
      //             </div>
      //             <div class="btn btn--group">
      //               <button class="btn btn--del">
      //                 <img src="./images/icon-delete.svg" alt="delete button" />
      //                 <span class="btn-txt txt--bold txt--red">Delete</span>
      //               </button>
      //               <button class="btn btn--edit">
      //                 <img src="./images/icon-edit.svg" alt="edit button" />
      //                 <span class="btn-txt txt--bold txt--blue">Edit</span>
      //               </button>

      //             </div>
      //           </div>
      //           <textarea
      //             name="comment"
      //             id="input__txt-area"
      //             cols="30"
      //             rows="5"
      //             class="input__txt-area"
      //             placeholder="Add a comment..."
      //           >${comment.content}</textarea
      //           >
      //           <div class="btn-update-wrap">
      //             <button class="btn--regu btn--update">
      //               <span class="btn-txt txt--bold">update</span>
      //             </button>
      //           </div>
      //         </div>
      //       `
    }

    const updateMyComment = function (target) {
      target = target.closest(".feed")
      const id = +target.getAttribute("id")
      findTargetIndex(id)
      let comment = ""
      if (commentIndex !== null && replyIndex !== null)
        comment = comments[commentIndex].replies[replyIndex]

      if (commentIndex !== null && replyIndex === null)
        comment = comments[commentIndex]

      //update data
      comment.content = target.querySelector(".edit__content").value
      persistComment()
      clear()
      render()
    }

    const reply = function (target) {
      //check if the textarea is empty
      target = target.closest(".btn--send")
      const targetFeed = target.closest(".feed")
      let content = target.previousElementSibling.value

      if (!content.trim().length) return

      if (targetFeed.classList.contains("comment-area--regu")) {
        comments.push({
          id: idCounter + 1,
          replies: [],
          content: content,
          createdAt: "now",
          score: 0,
          user: curUser,
        })
        idCounter++
      }

      if (targetFeed.classList.contains("comment-area--replyTo")) {
        content = target.previousElementSibling.value
          .split(" ")
          .splice(1)
          .join(" ")
        const id = +targetFeed.previousElementSibling.getAttribute("id")
        findTargetIndex(id)
        comments[commentIndex].replies.push({
          content: content,
          createdAt: "now",
          id: idCounter + 1,
          replyingTo: targetFeed.classList.contains("comment-area--replyTo")
            ? comments[commentIndex].user.username
            : comments[commentIndex].replies[replyIndex].user.username,
          score: 0,
          user: curUser,
        })
        idCounter++
      }

      persistComment()
      clear()
      render()
    }

    const findTargetIndex = function (id) {
      commentIndex = null
      replyIndex = null

      commentIndex = comments.findIndex((comment) => comment.id === id)
      if (commentIndex !== -1) return

      for (const [i, comment] of comments.entries()) {
        replyIndex = comment.replies.findIndex((reply) => reply.id === id)
        if (replyIndex !== -1) {
          commentIndex = i
          break
        }
      }
      // console.log(`this is comment index: ${commentIndex}`)
      // console.log(`this is reply index: ${replyIndex}`)
    }

    const delMyComment = function (target) {
      const id = +delTarget.getAttribute("id")
      findTargetIndex(id)
      if (commentIndex !== null && replyIndex !== null)
        comments[commentIndex].replies.splice(replyIndex, 1)

      if (commentIndex !== null && replyIndex === null)
        comments.splice(commentIndex, 1)

      persistComment()
      clear()
      render()
    }

    const scoreControl = function (target) {
      //score++
      if (
        target.classList.contains("score--plus") ||
        target.classList.contains("score--minus")
      ) {
        //update DOM
        target.classList.contains("score--plus")
          ? +target.nextElementSibling.textContent++
          : +target.previousElementSibling.textContent--

        //update data
        const id = +target.closest(".feed").getAttribute("id")
        findTargetIndex(id)
        if (commentIndex !== null && replyIndex !== null)
          target.classList.contains("score--plus")
            ? comments[commentIndex].replies[replyIndex].score++
            : comments[commentIndex].replies[replyIndex].score--

        if (commentIndex !== null && replyIndex === null)
          target.classList.contains("score--plus")
            ? comments[commentIndex].score++
            : comments[commentIndex].score--
      }

      persistComment()
    }

    const renderReplyBox = function (target) {
      const hasReplyTo = document.querySelector(".comment-area--replyTo")

      const id = +target.closest(".feed").getAttribute("id")
      findTargetIndex(id)

      if (commentIndex !== null && replyIndex !== null)
        comment = comments[commentIndex].replies[replyIndex]

      if (commentIndex !== null && replyIndex === null)
        comment = comments[commentIndex]

      const nextEl = target.closest(".feed").nextElementSibling
      if (nextEl.classList.contains("comment-area--replyTo")) {
        nextEl.remove()
        return
      }

      if (hasReplyTo) hasReplyTo.remove()

      target
        .closest(".feed")
        .insertAdjacentHTML(
          "afterend",
          textAreaMarkup(
            `${
              commentIndex !== null && replyIndex !== null
                ? "replyTo reply"
                : "replyTo"
            }`
          )
        )
    }

    const renderDelModal = function () {
      document.querySelector(".overlay").classList.toggle("hidden")
      document.querySelector(".del-comment-window").classList.toggle("hidden")
    }

    //Local storage ----------------------------------------------------
    const persistComment = function () {
      localStorage.setItem("comments", JSON.stringify(data))
    }

    const clearComment = function () {
      localStorage.clear("comments")
    }
    // clearComment()
  } catch (err) {
    console.error(err.message)
  }
}

controlComment()
