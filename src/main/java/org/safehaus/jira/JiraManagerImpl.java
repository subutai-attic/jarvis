package org.safehaus.jira;


import java.util.ArrayList;
import java.util.List;

import org.safehaus.exceptions.JiraClientException;
import org.safehaus.jira.model.JarvisIssue;
import org.safehaus.jira.model.JarvisIssueType;
import org.safehaus.jira.model.JarvisLink;
import org.safehaus.jira.model.JarvisMember;
import org.safehaus.model.JarvisProject;
import org.safehaus.util.JarvisContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.google.common.collect.Lists;

import net.rcarz.jiraclient.Issue;
import net.rcarz.jiraclient.IssueLink;
import net.rcarz.jiraclient.IssueType;
import net.rcarz.jiraclient.JiraException;
import net.rcarz.jiraclient.Project;
import net.rcarz.jiraclient.Status;
import net.rcarz.jiraclient.Transition;
import net.rcarz.jiraclient.greenhopper.GreenHopperClient;
import net.rcarz.jiraclient.greenhopper.RapidView;
import net.rcarz.jiraclient.greenhopper.Sprint;
import net.rcarz.jiraclient.greenhopper.SprintReport;


@Service( "jiraManager" )
public class JiraManagerImpl implements JiraManager
{
    private static Logger logger = LoggerFactory.getLogger( JiraManagerImpl.class );


    @Override
    public List<JarvisMember> getProjectMemebers( final String projectId ) throws JiraClientException
    {
        return getJiraClient() == null ? null : getJiraClient().getProjectMemebers( projectId );
    }


    @Override
    public List<JarvisIssue> getIssues( final String projectId ) throws JiraClientException
    {
        List<JarvisIssue> result = Lists.newArrayList();
        for ( Issue issue : getJiraClient().getIssues( projectId ) )
        {
            result.add( buildJarvisIssue( issue ) );
        }
        return result;
    }


    @Override
    public JarvisProject getProject( final String projectId ) throws JiraClientException


    {
        //        Project project = getJiraClient().getProject( projectId );
        //        List<String> types = new ArrayList<>();
        //
        //        for ( final IssueType issueType : project.getIssueTypes() )
        //        {
        //            types.add( issueType.getName() );
        //        }
        //        return new JarvisProject( project.getId(), project.getKey(), project.getName(), project
        // .getDescription(),
        //                types );
        return null;
    }


    @Override
    public List<JarvisMember> getProjectMembers( String projectId ) throws JiraClientException
    {
        List<JarvisMember> members = getJiraClient().getProjectMemebers( projectId );

        return members;
    }


    @Override
    public List<JarvisProject> getProjects() throws JiraClientException
    {
        List<Project> projects = getJiraClient().getAllProjects();
        List<JarvisProject> result = new ArrayList<>();

        for ( Project project : projects )
        {

            List<String> types = new ArrayList<>();

            for ( final IssueType issueType : project.getIssueTypes() )
            {
                types.add( issueType.getName() );
            }
            result.add( new JarvisProject( Long.valueOf( project.getId() ), project.getKey(), project.getName(),
                            project.getDescription(), types ) );
        }
        return result;
    }


    @Override
    public JarvisIssue getIssue( final String issueId ) throws JiraClientException
    {
        //        Issue issue = getJiraClient().getIssue( issueId );
        //
        //        return buildJarvisIssue( issue, getJiraClient().getTransitions( issueId ) );
        return null;
    }


    @Override
    public JarvisIssue createIssue( final JarvisIssue issue ) throws JiraClientException
    {
        //        Issue jiraIssue = getJiraClient().createIssue( issue );
        //        return buildJarvisIssue( jiraIssue );
        return null;
    }


    @Override
    public void buildBlocksChain( final String issueId, List<JarvisIssue> chain ) throws JiraClientException
    {

        JarvisIssue issue = getIssue( issueId );

        JarvisLink blockedIssueLink = issue.getLink( JiraRestClient.BLOCKS_LINK_NAME, JiraRestClient.OUTBOUND );
        if ( blockedIssueLink != null )
        {
            buildBlocksChain( blockedIssueLink.getKey(), chain );
        }

        chain.add( issue );
    }


    @Override
    public void startIssue( String issueKeyOrId ) throws JiraClientException
    {
        getJiraClient().startIssue( issueKeyOrId );
    }


    @Override
    public void resolveIssue( String issueKeyOrId ) throws JiraClientException
    {
        getJiraClient().resolveIssue( issueKeyOrId );
    }
    //
    //
    //    @Override
    //    public Status reopenIssue( final String id ) throws JiraClientException
    //    {
    //        return getJiraClient().changeStatus( id, ISSUE_REOPEN_ACTION_NAME );
    //    }
    //
    //
    //    @Override
    //    public Status storyStart( final String issueIdOrKey ) throws JiraClientException
    //    {
    //        return getJiraClient().changeStatus( issueIdOrKey, STORY_START_ACTION_NAME );
    //    }
    //
    //
    //    @Override
    //    public Status storyRequestApproval( final String issueIdOrKey ) throws JiraClientException
    //    {
    //        return getJiraClient().changeStatus( issueIdOrKey, STORY_REQUEST_APPROVAL_ACTION_NAME );
    //    }
    //
    //
    //    @Override
    //    public Status storyResolve( final String issueIdOrKey ) throws JiraClientException
    //    {
    //        return getJiraClient().changeStatus( issueIdOrKey, STORY_RESOLVE_ACTION_NAME );
    //    }
    //
    //
    //    @Override
    //    public Status storyApprove( final String issueIdOrKey ) throws JiraClientException
    //    {
    //        return getJiraClient().changeStatus( issueIdOrKey, STORY_APPROVE_ACTION_NAME );
    //    }
    //
    //
    //    @Override
    //    public Status storyReject( final String issueIdOrKey ) throws JiraClientException
    //    {
    //        return getJiraClient().changeStatus( issueIdOrKey, STORY_REJECT_ACTION_NAME );
    //    }


    @Override
    public Status reopenIssue( final String id ) throws JiraClientException
    {
        return getJiraClient().changeStatus( id, ISSUE_REOPEN_ACTION_NAME );
    }


    @Override
    public Status storyStart( final String issueIdOrKey ) throws JiraClientException
    {
        return getJiraClient().changeStatus( issueIdOrKey, STORY_START_ACTION_NAME );
    }


    @Override
    public Status storyRequestApproval( final String issueIdOrKey ) throws JiraClientException
    {
        return getJiraClient().changeStatus( issueIdOrKey, STORY_REQUEST_APPROVAL_ACTION_NAME );
    }


    @Override
    public Status storyResolve( final String issueIdOrKey ) throws JiraClientException
    {
        return getJiraClient().changeStatus( issueIdOrKey, STORY_RESOLVE_ACTION_NAME );
    }


    @Override
    public Status storyApprove( final String issueIdOrKey ) throws JiraClientException
    {
        return getJiraClient().changeStatus( issueIdOrKey, STORY_APPROVE_ACTION_NAME );
    }


    @Override
    public Status storyReject( final String issueIdOrKey ) throws JiraClientException
    {
        return getJiraClient().changeStatus( issueIdOrKey, STORY_REJECT_ACTION_NAME );
    }


    @Override
    public List<RapidView> getRapidViews() throws JiraException
    {
        return getJiraSprintClient().getRapidViews();
    }


    @Override
    public RapidView getRapidView( final int rapidViewId ) throws JiraException
    {
        return getJiraSprintClient().getRapidView( rapidViewId );
    }


    @Override
    public List<Sprint> getProjectSprints( final int rapidViewId ) throws JiraException
    {
        return getJiraSprintClient().getRapidView( rapidViewId ).getSprints();
    }


    @Override
    public SprintReport getSprintReport( final int rapidViewId, final int sprintId ) throws JiraException
    {
        List<Sprint> sprints = getProjectSprints( rapidViewId );
        for ( Sprint sprint : sprints )
        {
            if ( sprint.getId() == sprintId )
            {
                return getJiraSprintClient().getRapidView( rapidViewId ).getSprintReport( sprint );
            }
        }
        return null;
    }


    @Override
    public Sprint getSprint( final int rapidViewId, final int sprintId ) throws JiraException
    {
        return getSprintReport( rapidViewId, sprintId ).getSprint();
    }


    private JarvisIssue buildJarvisIssue( Issue issue ) throws JiraClientException
    {
        if ( issue == null )
        {
            return new JarvisIssue();
        }
        List<JarvisLink> links = Lists.newArrayList();
        for ( IssueLink link : issue.getIssueLinks() )
        {
            Issue i = getJiraClient().getIssue( link.getInwardIssue().getKey() );
            links.add(
                    new JarvisLink( Long.valueOf( i.getId() ), link.getInwardIssue().getKey(), link.getType().getName(),
                            link.getType().getOutward(), new JarvisIssueType( Long.valueOf( i.getIssueType().getId() ),
                            i.getIssueType().getName() ) ) );
        }

        issue.getSelf();
        return new JarvisIssue( Long.valueOf( issue.getId() ), issue.getKey(), issue.getSummary(), issue.getSelf(),
                new JarvisIssueType( Long.valueOf( issue.getIssueType().getId() ), issue.getIssueType().getName() ),
                issue.getDescription(), issue.getTimeTracking() != null ?
                                        ( issue.getTimeTracking().getRemainingEstimate() != null ?
                                          issue.getTimeTracking().getRemainingEstimate() : null ) : null,
                issue.getAssignee() != null ? issue.getAssignee().getName() : null,
                issue.getReporter() != null ? issue.getReporter().getName() : null, issue.getComponents().toString(),
                issue.getLabels().toString(), issue.getStatus().getName(),
                issue.getResolution() != null ? issue.getResolution().getName() : null,
                issue.getFixVersions() != null ? issue.getFixVersions().toString() : null,
                issue.getCreatedDate().toString(), links, issue.getProject().getKey(), null );
    }


    private JarvisIssue buildJarvisIssue( Issue issue, Iterable<Transition> transitions ) throws JiraClientException
    {
        if ( issue == null )
        {
            return new JarvisIssue();
        }
        List<JarvisLink> links = Lists.newArrayList();
        for ( IssueLink link : issue.getIssueLinks() )
        {
            Issue i = link.getInwardIssue();
            links.add( new JarvisLink( Long.valueOf( i.getId() ), i.getKey(), link.getType().getName(),
                    link.getType().getInward(),
                    new JarvisIssueType( Long.valueOf( i.getIssueType().getId() ), i.getIssueType().getName() ) ) );
        }

        issue.getSelf();
        return new JarvisIssue( Long.valueOf( issue.getId() ), issue.getKey(), issue.getSummary(), issue.getSelf(),
                new JarvisIssueType( Long.valueOf( issue.getIssueType().getId() ), issue.getIssueType().getName() ),
                issue.getDescription(), issue.getTimeTracking() != null ?
                                        ( issue.getTimeTracking().getRemainingEstimate() != null ?
                                          issue.getTimeTracking().getRemainingEstimate() : null ) : null,
                issue.getAssignee() != null ? issue.getAssignee().getName() : null,
                issue.getReporter() != null ? issue.getReporter().getName() : null, issue.getComponents().toString(),
                issue.getLabels().toString(), issue.getStatus().getName(),
                issue.getResolution() != null ? issue.getResolution().getName() : null,
                issue.getFixVersions() != null ? issue.getFixVersions().toString() : null,
                issue.getCreatedDate().toString(), links, issue.getProject().getKey(), transitions );
    }


    @Override
    public Iterable<Transition> getTransitions( String issueIdOrKey ) throws JiraClientException
    {
        return getJiraClient().getTransitions( issueIdOrKey );
    }


    @Override
    public Status toTransition( final String issueIdOrKey, final String id ) throws JiraClientException
    {
        return getJiraClient().changeStatus( issueIdOrKey, Integer.parseInt( id ) );
    }


    private JiraRestClient getJiraClient() throws JiraClientException
    {
        return JarvisContextHolder.getContext().getJiraRestClient();
    }


    private GreenHopperClient getJiraSprintClient()
    {
        return JarvisContextHolder.getContext().getJiraSprintClient();
    }
}
