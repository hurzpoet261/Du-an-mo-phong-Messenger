import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addComment } from "../lib/api.js";

const useAddComment = () => {
    const queryClient = useQueryClient();

    const { 
        mutate: addCommentMutation, 
        isPending 
    } = useMutation({
        mutationFn: ({ postId, text }) => addComment(postId, text),
        onSuccess: (data, variables) => {
            // variables chính là { postId, text } đã gửi đi
            // Làm mới cả 2:
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ['postDetail', variables.postId] });
        },
    });

    return { addCommentMutation, isPending };
};

export default useAddComment;