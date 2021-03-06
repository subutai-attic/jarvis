package org.safehaus.upsource.client;


import java.util.Date;
import java.util.Set;

import org.safehaus.upsource.model.FileAnnotation;
import org.safehaus.upsource.model.FileHistory;
import org.safehaus.upsource.model.Project;
import org.safehaus.upsource.model.ProjectActivity;
import org.safehaus.upsource.model.ProjectCommitters;
import org.safehaus.upsource.model.ResponsibilityDistribution;
import org.safehaus.upsource.model.ReviewCoverage;
import org.safehaus.upsource.model.ReviewCoverageStateEnum;
import org.safehaus.upsource.model.ReviewDescriptor;
import org.safehaus.upsource.model.ReviewList;
import org.safehaus.upsource.model.ReviewStatistics;
import org.safehaus.upsource.model.Revision;
import org.safehaus.upsource.model.RevisionDiffItem;
import org.safehaus.upsource.model.TimeUnitEnum;
import org.safehaus.upsource.model.UserActivity;


/**
 * This manager provides means to execute a most commonly used subset of UpSource API. All methods are read-only, they
 * do not perform amy mutator operations on UpSource.
 *
 * See <a href="https://upsource.jetbrains.com/~api_doc/index.html">UpSource REST API</a>
 */
public interface UpsourceManager
{
    public Set<Project> getAllProjects() throws UpsourceManagerException;

    public Project getProject( String projectId ) throws UpsourceManagerException;

    public Set<Revision> getRevisions( String projectId, int limit ) throws UpsourceManagerException;

    public Revision getHeadRevision( String projectId ) throws UpsourceManagerException;

    public Set<Revision> getFilteredRevisions( String projectId, int limit, String revisionFilter )
            throws UpsourceManagerException;

    public Revision getRevision( String projectId, String revisionId ) throws UpsourceManagerException;

    public Set<RevisionDiffItem> getRevisionChanges( String projectId, String revisionId, String compareToRevisionId,
                                                     int limit ) throws UpsourceManagerException;

    public Set<String> getRevisionBranches( String projectId, String revisionId ) throws UpsourceManagerException;

    public FileAnnotation getFileAnnotation( String projectId, String revisionId, String fileName )
            throws UpsourceManagerException;

    public Set<String> getFileContributors( String projectId, String revisionId, String fileName )
            throws UpsourceManagerException;

    public FileHistory getFileHistory( String projectId, String revisionId, String fileName )
            throws UpsourceManagerException;

    public ReviewList getReviews( String projectId, String query, int limit ) throws UpsourceManagerException;

    public ReviewDescriptor getReviewDetails( String projectId, String reviewId ) throws UpsourceManagerException;


    public ProjectActivity getProjectActivity( String projectId, String module, TimeUnitEnum period,
                                               long referenceTime ) throws UpsourceManagerException;

    public ResponsibilityDistribution getResponsibilityDistribution( String projectId, Date fromDate, Date toDate )
            throws UpsourceManagerException;

    public ProjectCommitters getProjectCommitters( String projectId ) throws UpsourceManagerException;

    public UserActivity getUserActivity( String projectId, TimeUnitEnum period, long referenceTime,
                                         Set<String> committers ) throws UpsourceManagerException;

    public ReviewStatistics getReviewStatistics( String projectId ) throws UpsourceManagerException;

    public ReviewCoverage getReviewCoverage( String projectId, ReviewCoverageStateEnum state, TimeUnitEnum period,
                                             long referenceTime ) throws UpsourceManagerException;
}
