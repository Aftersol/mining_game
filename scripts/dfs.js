function isVaild(x, y, visited)
{
  if (visited[numCols * y + x]) return false;
  if (x < 0 || x >= numCols || y < 0 || y >= numRows) return false;
  
  if (tiles[numCols * y + x] === tileType.TILE_WALL) {
    visited[numCols * y + x] = true;
    return false;
  }
  for (let i = 0; i < hazards.length; i++)
    {
      if (hazards[i].isInSamePosition(x,y)) {
        visited[numCols * y + x] = true;
        return false;
      }
    }
  return true;
}

function DFS(startX, startY, targetX, targetY)
{
  let visitedArray = new Array(numCols * numRows);
  visitedArray.fill(false);
  
  let st = []; // stack
  st.push([startX, startY]);
  
  while (st.length > 0)
  {
    let currentPos = st[st.length - 1];
    
    let currentX = currentPos[0];
    let currentY = currentPos[1];
    st.pop();
    
    if (!isVaild(currentX, currentY, visitedArray))
      continue;
      
    visitedArray[numCols * currentY + currentX] = true;

    if (currentX === targetX && currentY === targetY) return true;
    
    st.push([currentX,currentY-1]);
    st.push([currentX,currentY+1]);

    st.push([currentX-1,currentY]);

    st.push([currentX+1,currentY]);

  }
  
  return false;
  
}

/*Approach: The idea is to use Stack Data Structure to perform DFS Traversal on the 2D array. Follow the steps below to solve the given problem:

Initialize a stack, say S, with the starting cell coordinates as (0, 0).

Initialize an auxiliary boolean 2D array of dimension N * M with all values as false, which is used to mark the visited cells.

Declare a function isValid() to check if the cell coordinates are valid or not, i.e lies within the boundaries of the given matrix and is unvisited or not.

Iterate while the stack is not empty and perform the following steps:

Pop the cell present at the top of the stack and print the element at that cell.

Push the cell adjacent to the above-popped cells into the stack, if they are valid by checking using isValid() function. */