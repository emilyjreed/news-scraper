$(document).ready(function () {

    $(".save").on("click", function () {
        const id = $(this).data("id")
        $.ajax({
            url: `/news/save/${id}`,
            type: 'PUT',
            success: function (result) {
                location.reload();
            }
        });
    });

    $(".unsave").on("click", function () {
        const id = $(this).data("id")
        $.ajax({
            url: `/news/unsave/${id}`,
            type: 'PUT',
            success: function (result) {
                location.reload();
            }
        });
    });

    $(".scrape").on("click", function() {
        $.get("/scrape", (data, status) => {
            if (data.numOfnewItems > 0) {
                $(".report").text(`${data.numOfnewItems} more articles added`)
            }
            $(".articleCounter").modal("show");
            $('.articleCounter').on('hidden.bs.modal', function() {
                location.reload();
            });

        });
    });

    $(".addComment").on("click", function () {
        $("#commentModal").on("show.bs.modal", function (event) {
            const commentButton = $(event.relatedTarget)
            const id = commentButton.data("id")
            $(this).find(".modal-title").text(`Comments for article: ${id}`);
            $(this).find(".comment-save").data("id", id);
            $.get(`/comments/read/${id}`, (data, status) => {
                $(".comment-container").empty();
                const comments = data.notes;
                comments.forEach((comment) => {
                    const commentContent = $("<li class='list-group-item'>").text(comment.content);
                    const deleteBtn = $(`<button class="btn btn-primary disabled btn-sm comment-delete" data-noteid=${comment._id}>`).text("X")
                    deleteBtn.css({ "position": "absolute", "right": "1%" })
                    commentContent.append(deleteBtn)
                    $(".comment-container").append(commentContent)
                })
            })
        })
    })

    $(".comment-save").on("click", function (event) {
        event.preventDefault()
        const content = $(".commentText").val().trim();
        const id = $(this).data("id")
        if (content) {
            $.post(`/comments/save/${id}`, { content }, function (data, status) {
                $(".commentText").val("");
            })
        }
    })

    $(".comment-container").on("click", ".comment-delete", function (event) {
        const id = $(this).data("noteid")
        $.ajax({
            url: `/comments/delete/${id}`,
            type: 'DELETE',
            success: function (result) {
                location.reload();
            }
        });
    })
})